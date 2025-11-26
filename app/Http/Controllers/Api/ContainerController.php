<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContainerRequest;
use App\Models\Container;
use App\Services\Docker\ContainerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Support\Settings;
use RuntimeException;
use Throwable;
use Symfony\Component\HttpFoundation\Response;

class ContainerController extends Controller
{
    private ContainerService $containerService;

    public function __construct(ContainerService $containerService)
    {
        $this->containerService = $containerService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $containers = Auth::user()
            ->containers()
            ->with('stats')
            ->latest()
            ->get();
        return response()->json($containers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreContainerRequest $request)
    {
        $this->authorize('create', Container::class);

        $user = $request->user();

        if (!$user->canCreateContainer()) {
            return response()->json([
                'message' => 'Pro versiyaga o‘ting!',
            ], Response::HTTP_FORBIDDEN);
        }

        $validated = $request->validated();

        $payload = collect($validated)
            ->only(['name', 'subdomain', 'type', 'cpu_limit', 'memory_limit', 'disk_limit', 'env_vars'])
            ->toArray();

        $payload['env_vars'] = $this->normalizeEnvVars($request->input('env_vars', []));
        $payload['uuid'] = (string) Str::uuid();
        $payload['image'] = $this->resolveTemplateImage($payload['type']);

        if (!empty($payload['subdomain'])) {
            $payload['subdomain'] = $this->sanitizeSubdomain($payload['subdomain']);
        }

        $container = new Container($payload);
        $container->user_id = $user->id;
        $container->status = 'created';

        try {
            DB::transaction(function () use (&$container) {
                $container->save();

                if (!$this->containerService->create($container)) {
                    throw new RuntimeException('Docker container provisioning failed.');
                }
            });
        } catch (Throwable $exception) {
            Log::warning('Failed to provision container for user.', [
                'user_id' => $user->id,
                'error' => $exception->getMessage(),
            ]);

            if ($container->exists) {
                $container->delete();
            }

            return response()->json(['message' => 'Failed to create container'], 500);
        }

        return response()->json($container->fresh(), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Container $container)
    {
        $this->authorize('view', $container);
        return response()->json($container->load('stats'));
    }

    /**
     * Start the specified container.
     */
    public function start(Container $container)
    {
        $this->authorize('update', $container);

        if ($this->containerService->start($container)) {
            return response()->json($container);
        }

        return response()->json(['message' => 'Failed to start container'], 500);
    }

    /**
     * Stop the specified container.
     */
    public function stop(Container $container)
    {
        $this->authorize('update', $container);

        if ($this->containerService->stop($container)) {
            return response()->json($container);
        }

        return response()->json(['message' => 'Failed to stop container'], 500);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Container $container)
    {
        $this->authorize('delete', $container);

        if ($this->containerService->delete($container)) {
            return response()->json(null, 204);
        }

        return response()->json(['message' => 'Failed to delete container'], 500);
    }

    /**
     * Get container stats.
     */
    public function stats(Container $container)
    {
        $this->authorize('view', $container);

        $stats = $this->containerService->getStats($container);

        if ($stats) {
            return response()->json($stats);
        }

        $latest = $container->stats()->latest()->first();

        if ($latest) {
            return response()->json($latest);
        }

        return response()->json([
            'cpu_usage' => 0.0,
            'memory_usage' => 0.0,
            'disk_usage' => 0.0,
            'network_rx' => 0,
            'network_tx' => 0,
            'container_id' => $container->id,
        ]);
    }

    /**
     * Get container logs.
     */
    public function logs(Container $container)
    {
        $this->authorize('view', $container);

        $logs = $this->containerService->getLogs($container, 100);

        return response()->json([
            'lines' => $logs,
        ]);
    }

    /**
     * Update environment variables securely.
     */
    public function updateEnv(Container $container, Request $request)
    {
        $this->authorize('update', $container);

        $maxEnvVars = (int) config('containers.max_env_vars', 0);
        $envValueMaxLength = (int) config('containers.env_value_max_length', 256);
        $keyPattern = config('containers.env_key_regex', '/^[A-Z][A-Z0-9_]*$/');

        $validator = Validator::make($request->all(), [
            'env_vars' => ['required', 'array', 'max:' . $maxEnvVars],
            'env_vars.*' => ['nullable', 'string', 'max:' . $envValueMaxLength],
        ]);

        $validator->after(function ($validator) use ($request, $keyPattern) {
            $envVars = $request->input('env_vars');
            foreach ($envVars as $key => $value) {
                $normalizedKey = strtoupper(trim((string) $key));
                $normalizedKey = preg_replace('/[^A-Z0-9_]/', '_', $normalizedKey);

                if (!preg_match($keyPattern, $normalizedKey ?? '')) {
                    $validator->errors()->add('env_vars.' . $key, 'Invalid environment variable key.');
                }

                if (!is_null($value) && !is_scalar($value)) {
                    $validator->errors()->add('env_vars.' . $key, 'Environment values must be simple strings or numbers.');
                }
            }
        });

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $normalizedEnv = $this->normalizeEnvVars($request->input('env_vars', []));

        if (!$this->containerService->updateEnv($container, $normalizedEnv)) {
            return response()->json(['message' => 'Failed to update environment variables'], 500);
        }

        return response()->json($container->fresh());
    }

    public function options(Request $request)
    {
        $user = $request->user();

        $templates = config('containers.templates', []);
        $allowedImages = array_values($templates ?: config('containers.allowed_images', []));
        $limits = $user->planLimits();
        $maxContainers = (int) Settings::get('mini_services.max_per_user', $limits['max_containers'] ?? config('containers.max_containers_per_user', PHP_INT_MAX));
        $currentCount = $user->containers()->count();
        $isAdmin = (bool) $user->is_admin;
        $remaining = $isAdmin ? null : max(0, $maxContainers - $currentCount);
        $reservedSubdomains = config('containers.reserved_subdomains', []);
        $minXpRequired = (int) Settings::get('mini_services.min_xp_required', config('containers.min_xp_required', 0));
        $mysqlInstances = (int) Settings::get('mini_services.mysql_instances_per_user', config('containers.mysql_instances_per_user', 2));

        return response()->json([
            'allowed_images' => $allowedImages,
            'max_containers_per_user' => $isAdmin ? null : $maxContainers,
            'current_count' => $currentCount,
            'remaining_slots' => $remaining,
            'can_create' => $user->can('create', Container::class),
            'min_xp_required' => $minXpRequired,
            'max_env_vars' => (int) config('containers.max_env_vars', 0),
            'env_value_max_length' => (int) config('containers.env_value_max_length', 0),
            'domain_suffix' => config('containers.domain_suffix'),
            'reserved_subdomains' => $reservedSubdomains,
            'subdomain_min_length' => (int) config('containers.subdomain_min_length', 3),
            'subdomain_max_length' => (int) config('containers.subdomain_max_length', 30),
            'templates' => collect($templates)->map(function ($image, $type) {
                return [
                    'type' => $type,
                    'image' => $image,
                ];
            })->values()->all(),
            'mini_services' => [
                'enabled' => (bool) Settings::get('mini_services.enabled', true),
                'min_xp_required' => $minXpRequired,
                'max_per_user' => $maxContainers,
                'git_clone_enabled' => (bool) Settings::get('mini_services.git_clone_enabled', config('containers.git_clone_enabled', true)),
                'mysql_instances_per_user' => $mysqlInstances,
            ],
        ]);
    }

    private function resolveTemplateImage(string $type): string
    {
        $templates = config('containers.templates', []);

        if (!array_key_exists($type, $templates)) {
            throw new RuntimeException('Unsupported container template.');
        }

        return (string) $templates[$type];
    }

    private function normalizeEnvVars($envVars): array
    {
        if (!is_array($envVars)) {
            return [];
        }

        $normalized = [];
        foreach ($envVars as $key => $value) {
            if (!is_string($key) || trim($key) === '') {
                continue;
            }

            $normalizedKey = strtoupper(trim($key));
            $normalizedKey = preg_replace('/[^A-Z0-9_]/', '_', $normalizedKey);
            $normalizedKey = trim($normalizedKey, '_');

            if ($normalizedKey === '') {
                continue;
            }

            if (is_null($value)) {
                continue;
            }

            if (!is_scalar($value)) {
                continue;
            }

            $normalized[$normalizedKey] = (string) $value;
        }

        return $normalized;
    }

    private function sanitizeSubdomain(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = Str::lower($value);
        $normalized = preg_replace('/[^a-z0-9-]/', '-', $normalized) ?? '';
        $normalized = preg_replace('/-+/', '-', $normalized) ?? '';
        $normalized = trim($normalized, '-');

        return $normalized !== '' ? $normalized : null;
    }
}
