<?php

// file: app/Services/AI/OpenAiAssistant.php

namespace App\Services\AI;

use GuzzleHttp\Client;

class OpenAiAssistant implements AiAssistant
{
    public function __construct(private string $apiKey, private string $model) {}

    public function suggestAnswer(string $title, string $contentMarkdown): array
    {
        $client = new Client([
            'base_uri' => 'https://api.openai.com/v1/',
            'timeout' => 15,
        ]);

        $prompt = "User question title: {$title}\n\nContent (Markdown):\n{$contentMarkdown}\n\nProvide a high-quality, concise, step-by-step technical answer with code blocks if needed. Start with a short summary.";

        $resp = $client->post('chat/completions', [
            'headers' => ['Authorization' => "Bearer {$this->apiKey}"],
            'json' => [
                'model' => $this->model,
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a senior software engineer.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.2,
            ],
        ]);

        $data = json_decode((string) $resp->getBody(), true);
        $content = $data['choices'][0]['message']['content'] ?? '';

        return [
            'model' => $this->model,
            'content_markdown' => $content,
        ];
    }
}
