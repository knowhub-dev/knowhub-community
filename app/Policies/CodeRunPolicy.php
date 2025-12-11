<?php

namespace App\Policies;

use App\Models\CodeRun;
use App\Models\User;

class CodeRunPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, CodeRun $codeRun): bool
    {
        return $user->id === $codeRun->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // For now, any authenticated user can create a code run.
        // We can add plan-based limits here later if needed.
        return $user !== null;
    }
}
