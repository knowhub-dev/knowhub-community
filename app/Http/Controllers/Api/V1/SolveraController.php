<?php

namespace App\Http\Controllers\Api\V1;

use App\Support\Settings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SolveraController
{
    public function chat(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|min:4|max:4000',
            'context' => 'nullable|array',
        ]);

        $enabled = (bool) Settings::get('solvera.enabled', true);

        if (!$enabled) {
            return response()->json([
                'message' => 'SolVera hozircha o\'chirilgan.',
            ], 503);
        }

        $apiBase = rtrim(Settings::get('solvera.api_base', 'https://api.solvera.ai'), '/');
        $apiKey = Settings::get('solvera.api_key');
        $model = Settings::get('solvera.model', 'gtp-5');
        $temperature = (float) Settings::get('solvera.temperature', 0.25);
        $maxTokens = (int) Settings::get('solvera.max_tokens', 800);
        $persona = Settings::get(
            'solvera.persona',
            'Sen KnowHub hamjamiyatining SolVera nomli AI yordamchisisan. Iltimos, qisqa va amaliy takliflar ber, ' .
            'tajribali dasturchi uslubida javob qaytar va foydalanuvchining kontekstiga mos ravishda yo\'l ko\'rsat.'
        );

        if (!$apiKey) {
            return response()->json([
                'message' => 'SolVera API kaliti topilmadi. Iltimos, administrator bilan bog\'laning.',
            ], 500);
        }

        $messages = [
            ['role' => 'system', 'content' => $persona],
            ['role' => 'user', 'content' => $validated['message']],
        ];

        if (!empty($validated['context'])) {
            $messages[] = [
                'role' => 'system',
                'content' => 'Qo\'shimcha kontekst: ' . json_encode($validated['context']),
            ];
        }

        try {
            $response = Http::withToken($apiKey)
                ->timeout(18)
                ->post($apiBase . '/chat/completions', [
                    'model' => $model,
                    'messages' => $messages,
                    'temperature' => $temperature,
                    'max_tokens' => $maxTokens,
                    'stream' => false,
                ]);

            if (!$response->successful()) {
                Log::warning('SolVera API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return response()->json([
                    'message' => 'SolVera bilan aloqa vaqtida xatolik yuz berdi.',
                    'status' => $response->status(),
                ], 502);
            }

            $payload = $response->json();
            $reply = $payload['choices'][0]['message']['content'] ?? null;

            if (!$reply) {
                return response()->json([
                    'message' => 'SolVera javobi bo\'sh keldi. Birozdan so\'ng urinib ko\'ring.',
                ], 502);
            }

            return response()->json([
                'reply' => $reply,
            ]);
        } catch (\Exception $exception) {
            Log::error('SolVera API call failed', [
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'message' => 'SolVera bilan ulanish imkoni bo\'lmadi. Iltimos, keyinroq urinib ko\'ring.',
            ], 500);
        }
    }
}
