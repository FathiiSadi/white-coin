<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavingsGoal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SavingsGoalController extends Controller
{
    public function index()
    {
        return Auth::user()->savingsGoals;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0',
            'current_amount' => 'nullable|numeric|min:0',
            'target_date' => 'nullable|date',
        ]);

        return Auth::user()->savingsGoals()->create($validated);
    }

    public function show(SavingsGoal $savingsGoal)
    {
        $this->authorize('view', $savingsGoal);
        return $savingsGoal;
    }

    public function update(Request $request, SavingsGoal $savingsGoal)
    {
        $this->authorize('update', $savingsGoal);
        
        $validated = $request->validate([
            'name' => 'string|max:255',
            'target_amount' => 'numeric|min:0',
            'current_amount' => 'numeric|min:0',
            'target_date' => 'date',
        ]);

        $savingsGoal->update($validated);
        return $savingsGoal;
    }

    public function destroy(SavingsGoal $savingsGoal)
    {
        $this->authorize('delete', $savingsGoal);
        $savingsGoal->delete();
        return response()->noContent();
    }
}
