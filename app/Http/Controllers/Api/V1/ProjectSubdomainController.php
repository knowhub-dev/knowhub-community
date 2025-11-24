<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Container;
use App\Rules\ReservedSubdomain;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProjectSubdomainController extends Controller
{
    public function serve(Request $request, string $subdomain, ?string $path = null)
    {
        $validator = Validator::make(['subdomain' => $subdomain], [
            'subdomain' => ['required', 'string', new ReservedSubdomain()],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Subdomain is reserved and cannot be served.',
                'subdomain' => $subdomain,
            ], 403);
        }

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
