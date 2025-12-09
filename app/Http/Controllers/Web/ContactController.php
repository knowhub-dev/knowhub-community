<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        try {
            // Log the contact form submission
            Log::info('Contact form submitted', [
                'name' => $data['name'],
                'email' => $data['email'],
                'subject' => $data['subject'],
                'ip' => $request->ip(),
            ]);

            // In a real application, you would send an email here
            // Mail::to('info@knowhub.uz')->send(new ContactFormMail($data));

            return back()->with('success', 'Xabaringiz muvaffaqiyatli yuborildi! Tez orada javob beramiz.');
        } catch (\Exception $e) {
            Log::error('Contact form error: '.$e->getMessage());

            return back()->with('error', 'Xabar yuborishda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
        }
    }
}
