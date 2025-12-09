<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;

class ProfileWebController extends Controller
{
    public function show(string $username)
    {
        $user = User::with('level')->where('username', $username)->firstOrFail();

        return view('profile.show', compact('user'));
    }
}
