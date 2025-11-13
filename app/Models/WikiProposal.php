<?php

// file: app/Models/WikiProposal.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WikiProposal extends Model
{
    protected $fillable = ['article_id','user_id','content_markdown','comment','status'];

    public function article(): BelongsTo { return $this->belongsTo(WikiArticle::class, 'article_id'); }

    public function user(): BelongsTo { return $this->belongsTo(User::class, 'user_id'); }
}

