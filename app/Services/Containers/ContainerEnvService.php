<?php

namespace App\Services\Containers;

use App\Models\Container;
use App\Models\ContainerEnvVar;
use Illuminate\Support\Arr;

class ContainerEnvService
{
    public function index(Container $container)
    {
        return $container->envVars;
    }

    public function store(Container $container, array $data): ContainerEnvVar
    {
        return $container->envVars()->create([
            'key' => Arr::get($data, 'key'),
            'value' => Arr::get($data, 'value'),
        ]);
    }

    public function update(ContainerEnvVar $envVar, array $data): ContainerEnvVar
    {
        $envVar->fill($data);
        $envVar->save();

        return $envVar;
    }

    public function destroy(ContainerEnvVar $envVar): void
    {
        $envVar->delete();
    }

    /**
     * @param  array<string,string|null>  $envVars
     */
    public function syncFromArray(Container $container, array $envVars): void
    {
        $keys = array_keys($envVars);

        if (! empty($keys)) {
            $container->envVars()->whereNotIn('key', $keys)->delete();
        }

        foreach ($envVars as $key => $value) {
            $container->envVars()->updateOrCreate(
                ['key' => $key],
                ['value' => $value ?? '']
            );
        }
    }

    /** @return array<string,string> */
    public function compile(Container $container): array
    {
        return $container->envVars()->get()->mapWithKeys(fn ($env) => [$env->key => (string) $env->value])->all();
    }
}
