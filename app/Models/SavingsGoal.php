<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'name', 'target_amount', 'current_amount', 'deadline'])]
class SavingsGoal extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
