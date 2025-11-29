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
            'key' => ['sometimes', 'string'],
            'value' => ['nullable', 'string'],
        ];
    }
}
