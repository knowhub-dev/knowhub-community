<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Container\UpdateFileRequest;
use App\Models\Container;
use App\Services\Containers\ContainerFilesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ContainerFilesController extends Controller
{
    public function __construct(private readonly ContainerFilesService $filesService)
    {
    }

    public function index(Container $container): JsonResponse
    {
        Gate::authorize('view', $container);

        $files = $this->filesService->list($container);

        return response()->json(['data' => $files, 'meta' => ['count' => count($files)]]);
    }

    public function show(Container $container, Request $request): JsonResponse
    {
        Gate::authorize('view', $container);

        $content = $this->filesService->read($container, $request->get('path', ''));

        return response()->json(['data' => ['content' => $content], 'meta' => null]);
    }

    public function update(Container $container, UpdateFileRequest $request): JsonResponse
    {
        Gate::authorize('update', $container);

        $payload = $request->validated();
        $this->filesService->write(
            $container,
            $payload['path'],
            $payload['content'] ?? '',
            $payload['operation']
        );

        return response()->json(['data' => null, 'meta' => null]);
    }

    public function destroy(Container $container, Request $request): JsonResponse
    {
        Gate::authorize('update', $container);
        $path = $request->get('path', '');
        $this->filesService->delete($container, $path);

        return response()->json(['data' => null, 'meta' => null]);
    }
}
