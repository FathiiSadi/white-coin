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
        $goals = $user->savingsGoals()->get()->toArray();
        $dependents = $user->dependents()->get()->toArray();

        return json_encode([
            'transactions' => $transactions,
            'income' => $income,
            'goals' => $goals,
            'dependents' => $dependents,
        ]);
    }

    public function getSystemPrompt(User $user)
    {
        $context = $this->gatherUserContext($user);
        return "You are an expert financial advisor. Here is the user's financial data: \n" . $context;
    }

    public function streamChatCompletion($messages)
    {
        return function () use ($messages) {
            $ch = curl_init('https://api.openai.com/v1/chat/completions');
            $data = [
                'model' => 'gpt-3.5-turbo',
                'messages' => $messages,
                'stream' => true,
            ];

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
            ['role' => 'user', 'content' => 'Review my financial data and ask me 3 to 4 detailed clarification questions to deeply understand my financial situation, risk tolerance, and long-term aspirations needed to create a comprehensive, highly personalized financial plan. Please always start with a friendly "Hello!" before asking the questions. Keep it professional but friendly.'],
        ];

        return response()->stream($this->streamChatCompletion($messages), 200, [
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Content-Type' => 'text/event-stream',
        ]);
    }

    public function generateFinancialPlan(User $user, $clarificationHistory)
    {
        $messages = [
            ['role' => 'system', 'content' => $this->getSystemPrompt($user)],
        ];

        foreach ($clarificationHistory as $msg) {
            $messages[] = ['role' => $msg['role'], 'content' => $msg['content']];
        }

        $messages[] = ['role' => 'user', 'content' => 'Based on my data and the clarifications, generate a comprehensive financial plan. Use markdown and the following sections: Net Worth Summary, Cash Flow & Budget, Savings Plan, Goal Tracker, Action Plan & Priorities.'];

        return response()->stream($this->streamChatCompletion($messages), 200, [
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Content-Type' => 'text/event-stream',
        ]);
    }

    public function editPlanSection(FinancialPlan $plan, $instruction)
    {
        $user = $plan->user;
        $messages = [
            ['role' => 'system', 'content' => $this->getSystemPrompt($user)],
            ['role' => 'user', 'content' => "Here is my current financial plan:\n" . json_encode($plan->plan_data) . "\n\nInstruction for modification: {$instruction}\nRewrite the ENTIRE financial plan incorporating this modification. Use the exact same formatting and markdown sections as the original."],
        ];

        return response()->stream($this->streamChatCompletion($messages), 200, [
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Content-Type' => 'text/event-stream',
        ]);
    }
}
