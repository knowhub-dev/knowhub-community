<?php

namespace App\Http\Requests\Container;

use Illuminate\Foundation\Http\FormRequest;

class StoreContainerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'image' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:code_runner,dev_service,bot'],
            'cpu_limit' => ['nullable', 'integer', 'min:1'],
            'ram_limit_mb' => ['nullable', 'integer', 'min:1'],
            'internal_port' => ['required', 'integer', 'min:1'],
            'public_port' => ['nullable', 'integer', 'min:1'],
            'restart_policy' => ['nullable', 'in:none,on-failure,always'],
            'env' => ['nullable', 'array'],
            'env.*.key' => ['required_with:env', 'string'],
            'env.*.value' => ['nullable', 'string'],
        ];
    }
}
