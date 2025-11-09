<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\AI\AiAssistant;
use App\Services\AI\OpenAiAssistant;
use App\Services\CodeRun\CodeRunner;
use App\Services\CodeRun\PistonCodeRunner;
use App\Services\Docker\ContainerService;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // AI Service binding
        $this->app->bind(AiAssistant::class, function ($app) {
            return new OpenAiAssistant(
                config('services.ai.openai.api_key'),
                config('services.ai.openai.model')
            );
        });

        // Code Runner Service binding
        $this->app->bind(CodeRunner::class, function ($app) {
            return new PistonCodeRunner(
                config('services.piston.base_url'),
                config('services.piston.timeout_ms')
            );
        });

        // Container Service binding
        $this->app->singleton(ContainerService::class, function ($app) {
            return new ContainerService();
        });
    }

    public function boot(): void
    {
        // Model relationships and observers can be registered here
    }
}





