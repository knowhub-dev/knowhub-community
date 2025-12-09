<?php

// file: app/Models/Level.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Level extends Model
{
    protected $fillable = ['name', 'min_xp', 'icon'];
}
