<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Container;
use App\Policies\PostPolicy;
use App\Policies\CommentPolicy;
use App\Policies\ContainerPolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Post::class => PostPolicy::class,
        Comment::class => CommentPolicy::class,
        Container::class => ContainerPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}

