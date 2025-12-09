<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthWebController extends Controller
{
    public function showLogin()
    {
        return view('auth.login');
    }

    public function showRegister()
    {
        return view('auth.register');
    }

    public function login(Request $req)
    {
        $credentials = $req->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
        if (Auth::attempt($credentials)) {
            $req->session()->regenerate();

            return redirect()->intended(route('home'));
        }

        return back()->withErrors(['email' => 'Login yoki parol xato']);
    }

    public function register(Request $req)
    {
        $data = $req->validate([
            'name' => 'required|string|max:100',
            'username' => 'required|alpha_dash|unique:users,username',
            'email' => 'nullable|email|unique:users,email',
            'password' => 'required|min:6',
        ]);
        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);
        Auth::login($user);

        return redirect()->route('home');
    }

    public function logout(Request $req)
    {
        Auth::logout();
        $req->session()->invalidate();
        $req->session()->regenerateToken();

        return redirect()->route('home');
    }
}
