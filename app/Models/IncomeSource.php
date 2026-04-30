<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'name', 'type', 'amount', 'currency', 'frequency', 'start_date', 'is_active'])]
class IncomeSource extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
