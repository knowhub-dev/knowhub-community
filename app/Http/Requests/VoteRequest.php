<?php

// file: app/Http/Requests/VoteRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'votable_type' => ['required', 'in:post,comment'],
            'votable_id' => ['required', 'integer'],
            'value' => ['required', 'integer', 'in:-1,0,1'],
        ];
    }
}
