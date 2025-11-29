<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContainerMetricResource extends JsonResource
{
    /** @return array<string,mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'cpu_percent' => $this->cpu_percent,
            'ram_mb' => $this->ram_mb,
            'disk_mb' => $this->disk_mb,
            'recorded_at' => $this->recorded_at,
        ];
    }
}
