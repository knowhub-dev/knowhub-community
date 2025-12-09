<?php

// file: app/Http/Requests/CommentStoreRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CommentStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'content_markdown' => ['required', 'string'],
            'parent_id' => ['nullable', 'exists:comments,id'],
        ];
    }
}
