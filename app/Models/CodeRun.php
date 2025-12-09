<?php

// file: app/Models/CodeRun.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CodeRun extends Model
{
    protected $fillable = [
        'user_id', 'post_id', 'comment_id', 'language', 'source', 'stdout', 'stderr', 'exit_code', 'runtime_ms', 'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function comment(): BelongsTo
    {
        return $this->belongsTo(Comment::class);
    }
}
