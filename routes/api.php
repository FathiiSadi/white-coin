<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FinancialPlanController;
use App\Http\Controllers\Api\IncomeController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\SavingsGoalController;
use App\Http\Controllers\Api\DependentController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/check-email', [AuthController::class, 'checkEmail']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::put('/user', [AuthController::class, 'update']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('transactions', TransactionController::class);
    Route::apiResource('income-sources', IncomeController::class);
    Route::apiResource('dependents', DependentController::class);
    Route::apiResource('savings-goals', SavingsGoalController::class);
    
    Route::get('/financial-plan', [FinancialPlanController::class, 'index']);
    Route::post('/financial-plan/reset', [FinancialPlanController::class, 'resetPlan']);
    Route::post('/financial-plan/clarify', [FinancialPlanController::class, 'generateClarification']);
    Route::post('/financial-plan/clarify-next', [FinancialPlanController::class, 'generateNextClarification']);
    Route::post('/financial-plan/answer', [FinancialPlanController::class, 'answerClarification']);
    Route::post('/financial-plan/save', [FinancialPlanController::class, 'savePlan']);
    Route::post('/financial-plan/chat', [FinancialPlanController::class, 'chat']);
});
