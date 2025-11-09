<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Container;
use App\Services\Docker\ContainerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ContainerController extends Controller
{
    private $containerService;

    public function __construct(ContainerService $containerService)
    {
        $this->containerService = $containerService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $containers = Auth::user()->containers()->with('stats')->get();
        return response()->json($containers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'image' => 'required|string',
            'cpu_limit' => 'required|integer|min:1|max:4',
            'memory_limit' => 'required|integer|min:128|max:2048',
            'disk_limit' => 'required|integer|min:1024|max:10240',
            'env_vars' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $container = new Container($request->all());
        $container->user_id = Auth::id();
        $container->status = 'created';
        $container->save();

        if (!$this->containerService->create($container)) {
            $container->delete();
            return response()->json(['message' => 'Failed to create container'], 500);
        }

        return response()->json($container, 201);
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

        return response()->json(['message' => 'Failed to get container stats'], 500);
    }
}
