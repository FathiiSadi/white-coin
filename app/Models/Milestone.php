<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'title', 'description', 'date', 'is_completed'])]
class Milestone extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
