<?php

namespace App\Http\Requests\Container;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'path' => ['required', 'string'],
            'content' => ['nullable', 'string'],
            'operation' => ['required', 'in:write,append'],
        ];
    }
}
