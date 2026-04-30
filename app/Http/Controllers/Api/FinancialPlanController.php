<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\FinancialPlanService;
use App\Models\FinancialPlan;

class FinancialPlanController extends Controller
{
    protected $planService;

    public function __construct(FinancialPlanService $planService)
    {
        $this->planService = $planService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $plan = $user->financialPlan;

        if (!$plan) {
            return response()->json([
                'status' => 'no_plan',
                'plan' => null,
            ]);
        }

        return response()->json([
            'status' => $plan->status,
            'plan' => $plan->plan_data,
            'clarification_history' => $plan->clarification_history,
        ]);
    }

    public function resetPlan(Request $request)
    {
        $user = $request->user();
        if ($user->financialPlan) {
            $user->financialPlan->delete();
        }
        return response()->json(['status' => 'success']);
    }

    public function generateClarification(Request $request)
    {
        $user = $request->user();
        return $this->planService->generateClarificationQuestions($user);
    }

    public function generateNextClarification(Request $request)
    {
        $request->validate([
            'history' => 'required|array',
            'history.*.role' => 'required|string',
            'history.*.content' => 'required|string',
        ]);
        $user = $request->user();
        return $this->planService->generateNextClarificationQuestion($user, $request->input('history'));
    }

    public function answerClarification(Request $request)
    {
        $request->validate([
            'history' => 'required|array',
            'history.*.role' => 'required|string',
            'history.*.content' => 'required|string',
        ]);

        $user = $request->user();
        $history = $request->input('history');
        
        // Let the service stream the answer. We will also need a way to save the plan.
        // For simplicity, the frontend will receive the stream, construct the plan string, 
        // and hit a save endpoint OR we stream and save in the backend simultaneously.
        // Given SSE stream in PHP is a blocking operation outputting to buffer,
        // it's easier if the frontend sends a separate request to save the finalized plan data 
        // once the stream is done, or we do it via a listener. 
        // Let's rely on the frontend calling a save endpoint after generation for now.
        
        return $this->planService->generateFinancialPlan($user, $history);
    }

    public function savePlan(Request $request)
    {
        $request->validate([
            'plan_data' => 'nullable|string',
            'history' => 'required|array',
            'status' => 'required|string'
        ]);

        $user = $request->user();
        $plan = $user->financialPlan()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'plan_data' => $request->input('plan_data', ''),
                'clarification_history' => $request->input('history'),
                'status' => $request->input('status'),
            ]
        );

        return response()->json(['status' => 'success', 'plan' => $plan]);
    }

    public function chat(Request $request)
    {
        $request->validate([
            'instruction' => 'required|string',
        ]);

        $user = $request->user();
        $plan = $user->financialPlan;

        if (!$plan) {
            return response()->json(['error' => 'No plan found'], 404);
        }

        return $this->planService->editPlanSection($plan, $request->input('instruction'));
    }
}
