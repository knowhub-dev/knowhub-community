<?php

namespace App\Policies;

use App\Models\Container;
use App\Models\User;

class ContainerPolicy
{
    public function view(User $user, Container $container): bool
    {
        return $user->id === $container->user_id;
    }

    public function update(User $user, Container $container): bool
    {
        return $user->id === $container->user_id;
    }

    public function delete(User $user, Container $container): bool
    {
        return $user->id === $container->user_id;
    }

    public function manage(User $user, Container $container): bool
    {
        return $user->id === $container->user_id;
    }

    public function create(User $user): bool
    {
        return $user !== null;
    }
}
