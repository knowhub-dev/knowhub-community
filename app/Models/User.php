<?php
// file: app/Models/User.php
namespace App\Models;

// Barcha kerakli importlar
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'avatar_url',
        'bio',
        'website_url',
        'github_url',
        'linkedin_url',
    ];

    /**
     * The attributes that should be hidden for serialization.
     * @var array<int, string>
     */
    protected $hidden = [ 'password', 'remember_token' ];

    /**
     * The attributes that should be cast.
     * @var array<string, string>
     */
    protected $casts = [
        'is_admin' => 'boolean',
        'is_banned' => 'boolean',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'resume_data' => 'array',
    ];

    /**
     * User'ning Level'i
     */
    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class);
    }

    /**
     * User yozgan postlar
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    /**
     * User yozgan kommentlar
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function badges(): BelongsToMany
    {
        return $this->belongsToMany(Badge::class, 'user_badges')
            ->withPivot('awarded_at');
    }

    public function xpTransactions(): HasMany
    {
        return $this->hasMany(XpTransaction::class);
    }

    // =======================================================
    // XATONI TUZATADIGAN JOY (Sening Migratsiyang Asosida)
    // =======================================================

    /**
     * User'ning kuzatuvchilari (followers)
     * "Meni kuzatayotganlar"
     */
    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 
            'following_id', // Men kuzatilayotganman
            'follower_id'   // Ular meni kuzatyapti
        );
    }

    /**
     * User kuzatayotganlar (following)
     * "Men kuzatayotganlar"
     */
    public function following(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 
            'follower_id',    // Men kuzatyapman
            'following_id'  // Ularni kuzatyapman
        );
    }

    /**
     * User saqlagan postlar (bookmarks)
     */
    public function bookmarks(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'bookmarks');
    }

    /**
     * User'ning mini-serverlari
     */
    public function containers(): HasMany
    {
        return $this->hasMany(Container::class);
    }

    public function featuredContainers(): HasMany
    {
        return $this->containers()->where('is_featured', true);
    }
}