<?php

namespace App\Policies;

use App\Models\Container;
use App\Models\User;
use Illuminate\Support\Facades\Config;
use App\Support\Settings;

class ContainerPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view containers list
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Container $container): bool
    {
        return $user->id === $container->user_id || $user->is_admin;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        if ($user->is_admin) {
            return true;
        }

        $minXp = (int) Settings::get('mini_services.min_xp_required', Config::get('containers.min_xp_required', 0));
        $maxContainers = (int) Settings::get('mini_services.max_per_user', Config::get('containers.max_containers_per_user', PHP_INT_MAX));

        if ($user->xp < $minXp) {
            return false;
        }

        return $user->containers()->count() < $maxContainers;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Container $container): bool
    {
        return $user->id === $container->user_id || $user->is_admin;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Container $container): bool
    {
        return $user->id === $container->user_id || $user->is_admin;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Container $container): bool
    {
        return $user->is_admin;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Container $container): bool
    {
        return $user->is_admin;
}
}
