<?php
namespace App\Services\CodeRun;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Arr;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Log;

class PistonCodeRunner implements CodeRunner
{
    public function __construct(private string $baseUrl, private int $timeoutMs) {}

    public function run(string $language, string $source): array
    {
        $lang = match ($language) {
            'javascript' => 'js',
            'typescript' => 'ts',
            'python' => 'py',
            'php' => 'php',
            'c++' => 'cpp',
            default => $language
        };

        $runTimeout = min($this->timeoutMs, 3000);
        $client = new Client(['base_uri' => $this->baseUrl, 'timeout' => $this->timeoutMs / 1000]);

        $payload = [
            'language' => $lang,
            'version' => '*',
            'files' => [['content' => $source]],
            'stdin' => '',
            'args' => [],
            'compile_timeout' => $runTimeout,
            'run_timeout' => $runTimeout,
        ];

        try {
            $resp = $client->post('/execute', ['json' => $payload]);
        } catch (ConnectException $exception) {
            Log::warning('Piston connection failed', ['error' => $exception->getMessage()]);
            throw new HttpResponseException(
                response()->json(['message' => 'Code execution service unavailable. Please try again later.'], 503)
            );
        } catch (RequestException $exception) {
            Log::error('Piston request failed', ['error' => $exception->getMessage()]);
            throw new HttpResponseException(
                response()->json(['message' => 'Code execution request could not be completed.'], 503)
            );
        } catch (\Throwable $exception) {
            Log::error('Piston execution error', ['error' => $exception->getMessage()]);
            throw new HttpResponseException(
                response()->json(['message' => 'Unexpected error while running code.'], 503)
            );
        }

        $data = json_decode((string)$resp->getBody(), true);

        $stdout = Arr::get($data, 'run.stdout', '');
        $stderr = Arr::get($data, 'run.stderr', '');
        $code = (int) Arr::get($data, 'run.code', 0);
        $timeMs = (int) round((float) (Arr::get($data, 'run.signal', 0)) ?: 0);

        return ['stdout'=>$stdout, 'stderr'=>$stderr, 'code'=>$code, 'time_ms'=>$timeMs];
    }
}

