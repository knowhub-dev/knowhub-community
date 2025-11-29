<?php

namespace App\Services\Containers;

use App\Models\Container;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ContainerFilesService
{
    public function __construct(private readonly Filesystem $filesystem)
    {
    }

    /** @return array<int,string> */
    public function list(Container $container): array
    {
        $disk = Storage::disk('local');
        $base = $this->basePath($container);

        return $disk->exists($base) ? $disk->allFiles($base) : [];
    }

    public function read(Container $container, string $path): ?string
    {
        $disk = Storage::disk('local');
        $fullPath = $this->normalizePath($container, $path);

        return $disk->exists($fullPath) ? $disk->get($fullPath) : null;
    }

    public function write(Container $container, string $path, ?string $content, string $operation = 'write'): void
    {
        $disk = Storage::disk('local');
        $fullPath = $this->normalizePath($container, $path);
        $disk->ensureDirectoryExists(dirname($fullPath));

        if ($operation === 'append') {
            $disk->append($fullPath, $content ?? '');
            return;
        }

        $disk->put($fullPath, $content ?? '');
    }

    public function delete(Container $container, string $path): void
    {
        $disk = Storage::disk('local');
        $fullPath = $this->normalizePath($container, $path);
        $disk->delete($fullPath);
    }

    private function basePath(Container $container): string
    {
        return 'containers/' . $container->id;
    }

    private function normalizePath(Container $container, string $path): string
    {
        $path = Str::of($path)->ltrim('/')->toString();
        return $this->basePath($container) . '/' . $path;
    }
}
