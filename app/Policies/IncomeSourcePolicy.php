<?php

namespace App\Policies;

use App\Models\IncomeSource;
use App\Models\User;

class IncomeSourcePolicy
{
    public function view(User $user, IncomeSource $incomeSource): bool
    {
        return $user->id === $incomeSource->user_id;
    }

    public function update(User $user, IncomeSource $incomeSource): bool
    {
        return $user->id === $incomeSource->user_id;
    }

    public function delete(User $user, IncomeSource $incomeSource): bool
    {
        return $user->id === $incomeSource->user_id;
    }
}
