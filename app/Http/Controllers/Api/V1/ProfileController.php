<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
// Faylning yuqorisiga UserResource'ni chaqirib olamiz
use App\Http\Resources\UserResource; 

class ProfileController extends Controller
{
    public function me(Request $req) 
    { 
        // XATO KODNI O'CHIRDIK:
        // return $req->user()->only(['id','name','username','avatar_url','xp','bio']); 
        
        // ===========================================
        // TO'G'RI KODNI YOZDIK:
        // ===========================================
        return new UserResource($req->user());
    }

    public function update(Request $req)
    {
        $data = $req->validate([
            'name' => 'sometimes|string|max:100',
            'avatar_url' => 'sometimes|url',
            'bio' => 'sometimes|string|max:500',
            'website_url' => 'nullable|url|max:255',
            'github_url' => 'nullable|url|max:255',
            'linkedin_url' => 'nullable|url|max:255',
            'resume' => 'nullable|string|max:5000',
        ]);
        $user = $req->user();
        $user->fill($data)->save();
        
        // Bu yerda to'g'ri edi, UserResource'ni to'liq namespace bilan chaqirsa ham bo'ladi
        return new \App\Http\Resources\UserResource($user);
    }
}