<?php

namespace App\Providers;

use App\Models\Comment;
use App\Models\Container;
use App\Models\Post;
use App\Policies\CommentPolicy;
use App\Policies\ContainerPolicy;
use App\Policies\PostPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

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
