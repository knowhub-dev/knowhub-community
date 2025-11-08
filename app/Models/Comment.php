<?php
// file: app/Models/Comment.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany; // <-- BU MUHIM IMPORT

class Comment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'post_id',
        'parent_id', // <-- Buni ham qo'shib qo'yamiz, kerak bo'ladi
        'content_markdown',
        // 'content_html', // Buni bazadan o'chirgandik
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

    // =======================================================
    // XATONI TUZATADIGAN YANGI FUNKSIYALAR
    // =======================================================

    /**
     * Kommentning "otasi" (agar bu reply bo'lsa)
     * parent_id ustuniga bog'lanadi
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    /**
     * Kommentning "bolalari" (unga yozilgan reply'lar)
     * parent_id ustuniga bog'lanadi
     */
    public function children(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }
}