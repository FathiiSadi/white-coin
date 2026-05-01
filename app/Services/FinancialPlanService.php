<?php

namespace App\Services;

use App\Models\User;
use App\Models\FinancialPlan;
use Illuminate\Support\Facades\Http;

class FinancialPlanService
{
    protected mixed $apiKey;

    public function __construct()
    {
        $this->apiKey = env('OPENAI_API_KEY');
    }

    public function gatherUserContext(User $user)
    {
        $transactions = $user->transactions()->get()->toArray();
        $income = $user->incomeSources()->get()->toArray();
        $dependents = $user->dependents()->get()->toArray();

        // Explicitly map goal fields so the AI knows what current_saved means
        $goals = $user->savingsGoals()->get()->map(function ($goal) {
            return [
                'id'            => $goal->id,
                'name'          => $goal->name,
                'target_amount' => (float) $goal->target_amount,
                'current_saved' => (float) $goal->current_amount, // <-- key mapping
                'deadline'      => $goal->deadline,
            ];
        })->toArray();

        return json_encode([
            'transactions' => $transactions,
            'income'       => $income,
            'goals'        => $goals,
            'dependents'   => $dependents,
        ]);
    }

    public function getSystemPrompt(User $user)
    {
        $context = $this->gatherUserContext($user);
        return "You are a world-class financial advisor. Here is the user's current financial data context:
        
        USER DATA:
        {$context}";
    }

    private function getJsonRules()
    {
        return "
        CRITICAL RULES:
        1. OUTPUT FORMAT: You must return ONLY a valid JSON object. No markdown before or after.
        2. CURRENCY: Never mix currencies. Use the currency provided in context or JOD as default.
        3. NUMBERS: Fix all formatting errors. Use standard '$1,234.56' format for display strings but use raw numbers for data fields.
        4. PRIORITIES: The user's stated top priority MUST be 'High'. If priorities swap, exchange their values and shares exactly.
        5. MATH: months_to_goal = (target_amount - current_saved) / monthly_allocation. Never say 'TBD' if numbers exist.
        6. SAVINGS: Total monthly savings cannot exceed (Income - Expenses). Flag immediately if it does.
        7. BUDGET: Use the 50/30/20 rule (Needs/Wants/Savings), adjusted for dependents.
        8. GOALS DATA: When generating the 'goals' array, the 'saved' field MUST exactly equal the user's current 'balance' for that goal.
        9. SIX SECTIONS: Every plan must contain exactly: Financial Snapshot, Goals Breakdown, Budget Split, Risk & Recommendations, Action Plan (array of detailed paragraph strings), and Summary.
        ";
    }

    public function streamChatCompletion($messages, bool $jsonMode = false)
    {
        return function () use ($messages, $jsonMode) {
            $ch = curl_init('https://api.openai.com/v1/chat/completions');
            $data = [
                'model' => 'gpt-4o',
                'messages' => $messages,
                'stream' => true,
                'max_tokens' => 4096,
            ];

            if ($jsonMode) {
                $data['response_format'] = ['type' => 'json_object'];
            }
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->apiKey,
            ]);

            curl_setopt($ch, CURLOPT_WRITEFUNCTION, function ($ch, $chunk) {
                // We send the raw chunk so the frontend SSE can parse it directly
                // OpenAI chunks look like: data: {"choices":[{"delta":{"content":"Hello"}}]}
                echo $chunk;
                ob_flush();
                flush();
                return strlen($chunk);
            });

            curl_exec($ch);
            curl_close($ch);
        };
    }

    public function generateClarificationQuestions(User $user)
    {
        $messages = [
            ['role' => 'system', 'content' => $this->getSystemPrompt($user)],
            ['role' => 'user', 'content' => 'Review my USER DATA. If my income, expenses (from transactions), and savings goals are already present, do NOT ask for them again. Instead, greet me warmly and ask exactly ONE strategic question (e.g., about my risk tolerance, timeline for my top goal, or how much free cash I want to commit to savings). If basic numeric data IS missing, ask for the missing piece. NEVER ask multiple questions.'],
        ];

        return response()->stream($this->streamChatCompletion($messages), 200, [
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Content-Type' => 'text/event-stream',
        ]);
    }

    public function generateNextClarificationQuestion(User $user, $clarificationHistory)
    {
        $systemExtra = "
        CLARIFICATION RULES:
        - Ask exactly ONE follow-up question.
        - If the user gave a number, acknowledge it explicitly (e.g. 'Got it — 500 JOD/month savings.').
        - Do NOT ask multiple questions at once.
        - Do NOT ignore numbers the user provides.
        - If income, expenses, and goals are already known (from USER DATA or chat), ask about timeline, risk tolerance, or budget adjustments.
        - NEVER generate the actual financial plan or budget in this step. If you have enough information, just say: 'I have all the data I need! Please type yes or hit send to generate your dashboard.'
        ";
        $messages = [
            ['role' => 'system', 'content' => $this->getSystemPrompt($user) . $systemExtra],
        ];

        foreach ($clarificationHistory as $msg) {
            $messages[] = ['role' => $msg['role'], 'content' => $msg['content']];
        }

        return response()->stream($this->streamChatCompletion($messages), 200, [
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Content-Type' => 'text/event-stream',
        ]);
    }

    public function generateFinancialPlan(User $user, $clarificationHistory)
    {
        $messages = [
            ['role' => 'system', 'content' => $this->getSystemPrompt($user) . $this->getJsonRules()],
        ];

        foreach ($clarificationHistory as $msg) {
            $messages[] = ['role' => $msg['role'], 'content' => $msg['content']];
        }

        $messages[] = ['role' => 'user', 'content' => 'Generate my financial plan now. Return a JSON object with this structure:
        {
          "health_summary": "One-line health summary",
          "snapshot": { "income": 0, "expenses": 0, "savings": 0, "free_cash": 0, "health_score": 0 },
          "goals": [ { "name": "", "target": 0, "saved": 0, "monthly_allocation": 0, "projected_date": "", "priority": "High|Medium|Low" } ],
          "budget_split": { "needs": 0, "wants": 0, "savings": 0, "needs_percent": 0, "wants_percent": 0, "savings_percent": 0, "flags": [] },
          "risks_recommendations": [ "tip1", "tip2", "tip3" ],
          "action_plan": [ "Paragraph 1 detailing exact steps to take this month...", "Paragraph 2 detailing adjustments...", "Paragraph 3 long-term outlook..." ],
          "summary": "2-3 sentence plain-english summary"
        }'];

        return response()->stream($this->streamChatCompletion($messages, true), 200, [
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Content-Type' => 'text/event-stream',
        ]);
    }

    public function editPlanSection(FinancialPlan $plan, $instruction)
    {
        $user = $plan->user;
        $messages = [
            ['role' => 'system', 'content' => $this->getSystemPrompt($user) . $this->getJsonRules()],
            ['role' => 'user', 'content' => "Here is my current financial plan data:\n" . $plan->plan_data . "\n\nInstruction for modification: {$instruction}\n
            Rewrite the ENTIRE plan incorporating this change.
            You must return a JSON object with the exact same 6-section structure as before (including the action_plan array), but add an 'explanation' field at the root level containing your conversational response explaining what changed, the financial impact, and asking if they want to rebalance.
            If the user provides a specific number, it MUST drive all calculations.
            Return ONLY the JSON object."],
        ];

        return response()->stream($this->streamChatCompletion($messages, true), 200, [
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Content-Type' => 'text/event-stream',
        ]);
    }
}
