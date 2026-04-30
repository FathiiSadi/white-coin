<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dependent;
use Illuminate\Http\Request;

class DependentController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->dependents()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'relationship' => 'required|string',
            'age' => 'required|integer',
            'monthly_allocation' => 'numeric',
            'notes' => 'nullable|string',
        ]);

        return $request->user()->dependents()->create($validated);
    }

    public function update(Request $request, Dependent $dependent)
    {
        $this->authorize('update', $dependent);

        $validated = $request->validate([
            'name' => 'string',
            'relationship' => 'string',
            'age' => 'integer',
            'monthly_allocation' => 'numeric',
            'notes' => 'nullable|string',
        ]);

        $dependent->update($validated);
        return $dependent;
    }

    public function destroy(Dependent $dependent)
    {
        $this->authorize('delete', $dependent);
        $dependent->delete();
        return response()->noContent();
    }
}
