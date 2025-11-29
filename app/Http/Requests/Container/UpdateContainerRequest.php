<?php

namespace App\Http\Requests\Container;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContainerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'image' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'in:code_runner,dev_service,bot'],
            'cpu_limit' => ['nullable', 'integer', 'min:1'],
            'ram_limit_mb' => ['nullable', 'integer', 'min:1'],
            'internal_port' => ['nullable', 'integer', 'min:1'],
            'public_port' => ['nullable', 'integer', 'min:1'],
            'restart_policy' => ['nullable', 'in:none,on-failure,always'],
        ];
    }
}
