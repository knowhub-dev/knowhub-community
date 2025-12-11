<?php

namespace App\Http\Requests\Container;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEnvVarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'key' => [
                'sometimes',
                'string',
                'max:64',
                'regex:'.config('containers.env_key_regex', '/^[A-Z][A-Z0-9_]*$/'),
            ],
            'value' => ['nullable', 'string', 'max:'.config('containers.env_value_max_length', 256)],
        ];
    }
}
