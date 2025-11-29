<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\ContainerEnvResource;
use App\Http\Resources\ContainerEventResource;
use App\Http\Resources\ContainerMetricResource;

class ContainerResource extends JsonResource
{
    /** @return array<string,mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'image' => $this->image,
            'type' => $this->type,
            'status' => $this->status,
            'cpu_limit' => $this->cpu_limit,
            'ram_limit_mb' => $this->ram_limit_mb,
            'restart_policy' => $this->restart_policy,
            'internal_port' => $this->internal_port,
            'public_port' => $this->public_port,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'env' => ContainerEnvResource::collection($this->whenLoaded('envVars')),
            'events' => ContainerEventResource::collection($this->whenLoaded('events')),
            'metrics' => ContainerMetricResource::collection($this->whenLoaded('metrics')),
        ];
    }
}
