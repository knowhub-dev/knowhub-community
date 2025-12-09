<?php

// file: app/Http/Resources/CommentResource.php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'content_markdown' => $this->content_markdown,
            'score' => $this->score,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'username' => $this->user->username,
                'avatar_url' => $this->user->avatar_url,
            ],
            'children' => CommentResource::collection($this->whenLoaded('children')),
            'created_at' => $this->created_at,
        ];
    }
}
