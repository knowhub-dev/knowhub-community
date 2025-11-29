<?php

namespace App\Http\Requests\Container;

use Illuminate\Foundation\Http\FormRequest;

class StoreEnvVarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'key' => ['required', 'string'],
            'value' => ['nullable', 'string'],
        ];
    }
}
