<?php
// file: app/Models/Post.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory; // <-- QO'SHILDI
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Post extends Model
{
    use HasFactory; // <-- QO'SHILDI

    // Faktori ishlashi uchun buni qo'shamiz:
    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'slug',
        'content_markdown',
        'content_html',
        'status',
        'score',
        'views',
        'answers_count',
        'is_ai_suggested',
        'required_xp',
        'requires_verification'
    ];

    /**
     * Postning muallifi
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Postning kategoriyasi
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Postning kommentlari
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Postning teglari
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }
}