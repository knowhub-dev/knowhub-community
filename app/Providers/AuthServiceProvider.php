<?php

namespace App\Providers;

use App\Models\Comment;
use App\Models\Container;
use App\Models\CodeRun;
use App\Models\Post;
use App\Policies\CommentPolicy;
use App\Policies\ContainerPolicy;
use App\Policies\CodeRunPolicy;
use App\Policies\PostPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Post::class => PostPolicy::class,
        Comment::class => CommentPolicy::class,
        Container::class => ContainerPolicy::class,
        CodeRun::class => CodeRunPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
