<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->transactions()->orderBy('date', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric',
            'category' => 'nullable|string',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'type' => 'required|in:expense,income',
        ]);

        return $request->user()->transactions()->create($validated);
    }

    public function show(Transaction $transaction)
    {
        $this->authorize('view', $transaction);
        return $transaction;
    }

    public function update(Request $request, Transaction $transaction)
    {
        $this->authorize('update', $transaction);
        
        $validated = $request->validate([
            'amount' => 'numeric',
            'category' => 'nullable|string',
            'description' => 'nullable|string',
            'date' => 'date',
            'type' => 'in:expense,income',
            'is_categorized' => 'boolean',
        ]);

        $transaction->update($validated);
        return $transaction;
    }

    public function destroy(Transaction $transaction)
    {
        $this->authorize('delete', $transaction);
        $transaction->delete();
        return response()->noContent();
    }
}
