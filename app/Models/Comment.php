<?php
// file: app/Models/Comment.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; // <-- QO'SHILDI
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    use HasFactory; // <-- QO'SHILDI

    // Faktori ishlashi uchun buni qo'shamiz:
    protected $fillable = [
        'user_id',
        'post_id',
        'content_markdown',
        'content_html',
        'score',
    ];

    /**
     * Komment muallifi
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Komment tegishli bo'lgan post
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}