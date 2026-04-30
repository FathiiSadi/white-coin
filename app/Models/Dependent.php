<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'name', 'relationship', 'age', 'monthly_allocation', 'notes'])]
class Dependent extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
