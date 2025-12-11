<?php

// file: app/Http/Requests/CodeRunRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CodeRunRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'language' => ['required', 'string', 'in:python,javascript,typescript,php,go,java,c++'],
            'code' => ['required_without:source', 'string', 'max:10240'],
            'source' => ['sometimes', 'string', 'max:10240'],
            'post_slug' => ['nullable', 'exists:posts,slug'],
            'comment_id' => ['nullable', 'integer', 'exists:comments,id'],
        ];
    }
}
