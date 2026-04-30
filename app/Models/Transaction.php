<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'amount', 'category', 'description', 'date', 'type', 'is_categorized'])]
class Transaction extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
