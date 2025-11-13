<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Container;
use Illuminate\Http\Request;

class ProjectSubdomainController extends Controller
{
    public function serve(Request $request, string $subdomain, ?string $path = null)
    {
        $container = Container::query()
            ->whereNotNull('subdomain')
            ->where('subdomain', $subdomain)
            ->first();

        if (!$container) {
            return response()->json([
                'message' => 'Project not found.',
                'subdomain' => $subdomain,
            ], 404);
        }

        $hostIp = config('containers.port_range.host_ip', '127.0.0.1');
        $target = $container->port ? sprintf('http://%s:%d', $hostIp, $container->port) : null;

        return response()->json([
            'subdomain' => $subdomain,
            'container' => [
                'id' => $container->id,
                'name' => $container->name,
                'status' => $container->status,
                'image' => $container->image,
                'port' => $container->port,
            ],
            'proxy_target' => $target,
            'ready' => $container->status === 'running' && $target !== null,
            'requested_path' => '/' . ltrim($path ?? '', '/'),
        ]);
    }
}
