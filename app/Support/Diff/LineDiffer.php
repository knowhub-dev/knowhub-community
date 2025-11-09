<?php

namespace App\Support\Diff;

class LineDiffer
{
    /**
     * Generate a simple line-based diff between two strings.
     *
     * @return array{lines: array<int, array{type: 'context'|'added'|'removed', text: string}>, added: int, removed: int}
     */
    public function compare(string $original, string $changed): array
    {
        $originalLines = $this->splitIntoLines($original);
        $changedLines = $this->splitIntoLines($changed);

        $originalCount = count($originalLines);
        $changedCount = count($changedLines);

        $matrix = array_fill(0, $originalCount + 1, array_fill(0, $changedCount + 1, 0));

        for ($i = $originalCount - 1; $i >= 0; $i--) {
            for ($j = $changedCount - 1; $j >= 0; $j--) {
                if ($originalLines[$i] === $changedLines[$j]) {
                    $matrix[$i][$j] = $matrix[$i + 1][$j + 1] + 1;
                } else {
                    $matrix[$i][$j] = max($matrix[$i + 1][$j], $matrix[$i][$j + 1]);
                }
            }
        }

        $added = 0;
        $removed = 0;
        $lines = [];

        $i = 0;
        $j = 0;

        while ($i < $originalCount && $j < $changedCount) {
            if ($originalLines[$i] === $changedLines[$j]) {
                $lines[] = ['type' => 'context', 'text' => $originalLines[$i]];
                $i++;
                $j++;
            } elseif ($matrix[$i + 1][$j] >= $matrix[$i][$j + 1]) {
                $lines[] = ['type' => 'removed', 'text' => $originalLines[$i]];
                $removed++;
                $i++;
            } else {
                $lines[] = ['type' => 'added', 'text' => $changedLines[$j]];
                $added++;
                $j++;
            }
        }

        while ($i < $originalCount) {
            $lines[] = ['type' => 'removed', 'text' => $originalLines[$i]];
            $removed++;
            $i++;
        }

        while ($j < $changedCount) {
            $lines[] = ['type' => 'added', 'text' => $changedLines[$j]];
            $added++;
            $j++;
        }

        return [
            'lines' => $lines,
            'added' => $added,
            'removed' => $removed,
        ];
    }

    public function render(array $lines, string $originalLabel = 'Original', string $changedLabel = 'Changed'): string
    {
        $output = [
            sprintf('--- %s', $originalLabel),
            sprintf('+++ %s', $changedLabel),
        ];

        foreach ($lines as $entry) {
            $prefix = $this->prefixForType($entry['type'] ?? 'context');
            $output[] = $prefix . ($entry['text'] ?? '');
        }

        return implode("\n", $output);
    }

    private function splitIntoLines(string $text): array
    {
        $normalized = str_replace(["\r\n", "\r"], "\n", $text);

        if ($normalized === '') {
            return [];
        }

        return explode("\n", $normalized);
    }

    private function prefixForType(string $type): string
    {
        return match ($type) {
            'added' => '+',
            'removed' => '-',
            default => ' ',
        };
    }
}
