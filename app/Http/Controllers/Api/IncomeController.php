<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IncomeSource;
use Illuminate\Http\Request;

class IncomeController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->incomeSources()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'type' => 'required|string',
            'amount' => 'required|numeric',
            'currency' => 'nullable|string',
            'frequency' => 'nullable|string',
            'start_date' => 'required|date',
        ]);

        return $request->user()->incomeSources()->create($validated);
    }

    public function update(Request $request, IncomeSource $incomeSource)
    {
        $this->authorize('update', $incomeSource);

        $validated = $request->validate([
            'name' => 'string',
            'type' => 'string',
            'amount' => 'numeric',
            'currency' => 'string',
            'frequency' => 'string',
            'start_date' => 'date',
            'is_active' => 'boolean',
        ]);

        $incomeSource->update($validated);
        return $incomeSource;
    }

    public function destroy(IncomeSource $incomeSource)
    {
        $this->authorize('delete', $incomeSource);
        $incomeSource->delete();
        return response()->noContent();
    }
}
