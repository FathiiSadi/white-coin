<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinancialPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_data',
        'clarification_history',
        'status',
    ];

    protected $casts = [
        'plan_data' => 'array',
        'clarification_history' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
