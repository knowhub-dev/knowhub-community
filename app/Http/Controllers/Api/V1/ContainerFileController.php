<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Container;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response;

class ContainerFileController extends Controller
{
    public function index(Request $request, Container $container)
    {
        $this->authorize('view', $container);

        try {
            $relativePath = $this->normalizeRelativePath($request->query('path', ''));
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        }
        $target = $this->workspacePath($container, $relativePath);

        if (!Storage::disk('local')->exists($target)) {
            Storage::disk('local')->makeDirectory($target);
        }

        $workspacePrefix = $this->workspacePrefix($container);
        $directories = collect(Storage::disk('local')->directories($target))->map(fn ($dir) => [
            'name' => basename($dir),
            'path' => trim(Str::after($dir, $workspacePrefix . '/'), '/'),
            'type' => 'directory',
        ]);

        $files = collect(Storage::disk('local')->files($target))->map(fn ($file) => [
            'name' => basename($file),
            'path' => trim(Str::after($file, $workspacePrefix . '/'), '/'),
            'type' => 'file',
            'size' => Storage::disk('local')->size($file),
        ]);

        return response()->json($directories->merge($files)->values());
    }

    public function show(Request $request, Container $container)
    {
        $this->authorize('view', $container);

        try {
            $relativePath = $this->normalizeRelativePath($request->query('path', ''));
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        }
        if ($relativePath === '') {
            return response()->json(['message' => 'File path is required.'], Response::HTTP_BAD_REQUEST);
        }

        $target = $this->workspacePath($container, $relativePath);

        if (!Storage::disk('local')->exists($target)) {
            return response()->json(['message' => 'File not found.'], Response::HTTP_NOT_FOUND);
        }

        if (Str::endsWith($target, '/')) {
            return response()->json(['message' => 'Cannot read a directory.'], Response::HTTP_BAD_REQUEST);
        }

        $content = Storage::disk('local')->get($target);

        return response()->json([
            'path' => $relativePath,
            'content' => $content,
        ]);
    }

    public function store(Request $request, Container $container)
    {
        $this->authorize('update', $container);

        $validated = $request->validate([
            'path' => ['required', 'string'],
            'file' => ['nullable', 'file'],
            'folder' => ['nullable', 'string'],
        ]);

        try {
            $basePath = $this->normalizeRelativePath($validated['path'] ?? '');
            $folderName = $this->normalizeRelativePath($validated['folder'] ?? '');
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        }
        $targetDirectory = $this->workspacePath($container, $basePath);

        if ($folderName !== '') {
            $directory = $this->workspacePath($container, $this->joinPath($basePath, $folderName));
            Storage::disk('local')->makeDirectory($directory);

            return response()->json(['message' => 'Folder created.']);
        }

        if (!$request->hasFile('file')) {
            return response()->json(['message' => 'No file uploaded.'], Response::HTTP_BAD_REQUEST);
        }

        $uploadedFile = $request->file('file');
        $storedPath = $this->joinPath($targetDirectory, $uploadedFile->getClientOriginalName());
        Storage::disk('local')->putFileAs($targetDirectory, $uploadedFile, $uploadedFile->getClientOriginalName());

        return response()->json([
            'message' => 'File uploaded.',
            'path' => $this->relativeFromWorkspace($container, $storedPath),
        ]);
    }

    public function update(Request $request, Container $container)
    {
        $this->authorize('update', $container);

        $validated = $request->validate([
            'path' => ['required', 'string'],
            'content' => ['required', 'string'],
        ]);

        try {
            $relativePath = $this->normalizeRelativePath($validated['path']);
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        }
        $target = $this->workspacePath($container, $relativePath);

        Storage::disk('local')->put($target, $validated['content']);

        return response()->json(['message' => 'File saved.']);
    }

    private function workspacePrefix(Container $container): string
    {
        if (!$container->uuid) {
            $container->uuid = (string) Str::uuid();
            $container->save();
        }

        return sprintf('containers/%s', $container->uuid);
    }

    private function workspacePath(Container $container, string $relativePath): string
    {
        $prefix = $this->workspacePrefix($container);
        $normalized = $this->normalizeRelativePath($relativePath);

        return trim($normalized) === '' ? $prefix : sprintf('%s/%s', $prefix, $normalized);
    }

    private function normalizeRelativePath(string $path): string
    {
        $cleaned = str_replace('\\', '/', $path);
        $parts = array_filter(explode('/', $cleaned), fn ($part) => $part !== '' && $part !== '.');

        foreach ($parts as $part) {
            if ($part === '..') {
                throw new RuntimeException('Directory traversal is not allowed.');
            }
        }

        return implode('/', $parts);
    }

    private function joinPath(string $base, string $segment): string
    {
        $baseNormalized = $this->normalizeRelativePath($base);
        $segmentNormalized = $this->normalizeRelativePath($segment);

        return trim($baseNormalized) === '' ? $segmentNormalized : trim($baseNormalized . '/' . $segmentNormalized, '/');
    }

    private function relativeFromWorkspace(Container $container, string $path): string
    {
        return trim(Str::after($path, $this->workspacePrefix($container) . '/'), '/');
    }
}
