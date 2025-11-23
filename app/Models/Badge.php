<?php


// file: app/Models/Badge.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Badge extends Model
{
    protected $fillable = ['name','slug','icon','icon_key','level','description','xp_reward'];
}



?>
