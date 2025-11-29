<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Container;
use App\Services\Containers\ContainerLogsService;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ContainerLogsController extends Controller
{
    public function __construct(private readonly ContainerLogsService $logsService)
    {
    }

    public function stream(Container $container): StreamedResponse
    {
        Gate::authorize('view', $container);

        return response()->stream(function () use ($container) {
            $this->logsService->stream($container, function (string $line): void {
                echo 'data: ' . $line . "\n\n";
                if (ob_get_level()) {
                    ob_flush();
                }
                flush();
            });
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
        ]);
    }
}
