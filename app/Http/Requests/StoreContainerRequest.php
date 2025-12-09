<?php

namespace App\Http\Requests;

use App\Models\Container;
use App\Rules\ReservedSubdomain;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContainerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Container::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('name') && $this->input('name') !== null) {
            $this->merge([
                'name' => $this->sanitizeName($this->input('name')),
            ]);
        }

        if ($this->has('subdomain') && $this->input('subdomain') !== null) {
            $this->merge([
                'subdomain' => $this->sanitizeSubdomain($this->input('subdomain')),
            ]);
        }
    }

    public function rules(): array
    {
        $templateImages = config('containers.templates', []);
        $maxEnvVars = (int) config('containers.max_env_vars', 0);
        $envValueMaxLength = (int) config('containers.env_value_max_length', 256);
        $minSubdomainLength = (int) config('containers.subdomain_min_length', 3);
        $maxSubdomainLength = (int) config('containers.subdomain_max_length', 30);

        $allowedImages = array_values($templateImages ?: config('containers.allowed_images', []));

        return [
            'name' => ['required', 'string', 'max:80', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/'],
            'subdomain' => array_filter([
                'nullable',
                'string',
                'min:'.$minSubdomainLength,
                'max:'.$maxSubdomainLength,
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                new ReservedSubdomain,
                Rule::unique('containers', 'subdomain'),
            ]),
            'type' => ['nullable', 'string', Rule::in(array_keys($templateImages))],
            'image' => ['nullable', 'string', Rule::in($allowedImages)],
            'cpu_limit' => ['nullable', 'integer', 'min:1', 'max:4'],
            'memory_limit' => ['nullable', 'integer', 'min:128', 'max:2048'],
            'disk_limit' => ['nullable', 'integer', 'min:256', 'max:10240'],
            'env_vars' => ['nullable', 'array', 'max:'.$maxEnvVars],
            'env_vars.*' => ['nullable', 'string', 'max:'.$envValueMaxLength],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $envVars = $this->input('env_vars');
            if ($envVars === null) {
                return;
            }

            if (! is_array($envVars)) {
                $validator->errors()->add('env_vars', 'Environment variables must be an object of key/value pairs.');

                return;
            }

            $keyPattern = config('containers.env_key_regex', '/^[A-Z][A-Z0-9_]*$/');

            foreach ($envVars as $key => $value) {
                if (! is_string($key) || trim($key) === '') {
                    $validator->errors()->add('env_vars', 'Environment variable keys must be non-empty strings.');

                    continue;
                }

                $normalizedKey = strtoupper(trim((string) $key));
                $normalizedKey = preg_replace('/[^A-Z0-9_]/', '_', $normalizedKey);

                if (! preg_match($keyPattern, $normalizedKey)) {
                    $validator->errors()->add('env_vars.'.$key, 'Environment variable keys may only include uppercase letters, digits, and underscores.');
                }

                if (! is_null($value) && ! is_scalar($value)) {
                    $validator->errors()->add('env_vars.'.$key, 'Environment variable values must be simple strings or numbers.');
                }
            }
        });
    }

    private function sanitizeSubdomain(string $value): string
    {
        $value = strtolower(trim($value));
        $value = preg_replace('/[^a-z0-9-]/', '-', $value);
        $value = preg_replace('/-{2,}/', '-', $value);

        return trim($value, '-');
    }

    private function sanitizeName(string $value): string
    {
        $value = strtolower(trim($value));
        $value = preg_replace('/[^a-z0-9-]/', '-', $value);
        $value = preg_replace('/-{2,}/', '-', $value);

        return trim($value, '-');
    }
}
