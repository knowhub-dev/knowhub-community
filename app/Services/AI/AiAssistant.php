<?php

// file: app/Services/AI/AiAssistant.php

namespace App\Services\AI;

interface AiAssistant
{
    public function suggestAnswer(string $title, string $contentMarkdown): array;
}
