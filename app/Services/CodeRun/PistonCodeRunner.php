<?php

namespace App\Services\CodeRun;

use App\Jobs\RunCode;
use App\Models\CodeRun;
use App\Models\User;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Throwable;

class PistonCodeRunner implements CodeRunner
{
    public function __construct(private string $baseUrl, private int $defaultTimeoutMs)
    {
    }

    public function submit(
        User $user,
        string $language,
        string $source,
        ?int $postId = null,
        ?int $commentId = null
    ): CodeRun {
        $codeRun = CodeRun::create([
            'user_id' => $user->id,
            'post_id' => $postId,
            'comment_id' => $commentId,
            'language' => $this->normalizeLanguage($language),
            'source' => $source,
            'status' => CodeRun::STATUS_QUEUED,
        ]);

        RunCode::dispatch($codeRun);

        return $codeRun;
    }

    public function execute(CodeRun $codeRun): void
    {
        $timeout = $this->resolveTimeout($codeRun->user);
        $client = new Client(['base_uri' => $this->baseUrl, 'timeout' => $timeout / 1000]);

        $codeRun->update(['status' => CodeRun::STATUS_RUNNING]);

        $startedAt = microtime(true);
        $payload = [
            'language' => $this->normalizeLanguage($codeRun->language),
            'version' => '*',
            'files' => [['content' => $codeRun->source]],
            'stdin' => '',
            'args' => [],
            'compile_timeout' => $timeout,
            'run_timeout' => $timeout,
        ];

        if ($codeRun->user->hasPriorityExecution()) {
            $payload['priority'] = true;
        }

        try {
            $resp = $client->post('/execute', ['json' => $payload]);
            $data = json_decode((string) $resp->getBody(), true);

            $codeRun->update([
                'status' => CodeRun::STATUS_SUCCESS,
                'stdout' => $this->collectStdout($data),
                'stderr' => $this->collectStderr($data),
                'runtime_ms' => $this->extractRuntimeMs($data, $startedAt),
                'exit_code' => (int) Arr::get($data, 'run.code', Arr::get($data, 'code', 0)),
            ]);
        } catch (ConnectException $e) {
            $this->failRun($codeRun, 'Code execution service unavailable.', $e);
        } catch (RequestException $e) {
            $this->failRun($codeRun, 'Code execution request could not be completed.', $e);
        } catch (Throwable $e) {
            $this->failRun($codeRun, 'Unexpected error while running code.', $e);
        }
    }

    private function resolveTimeout(User $user): int
    {
        $fromPlan = (int) Arr::get($user->planLimits(), 'timeout_ms', 0);

        if ($fromPlan > 0) {
            return $fromPlan;
        }

        return $user->isPro() ? 15000 : $this->defaultTimeoutMs;
    }

    private function normalizeLanguage(string $language): string
    {
        return match (strtolower($language)) {
            'javascript', 'js' => 'js',
            'typescript', 'ts' => 'ts',
            'python', 'py' => 'py',
            'c++', 'cpp' => 'cpp',
            default => strtolower($language),
        };
    }

    private function extractRuntimeMs(array $data, float $startedAt): int
    {
        $runtimeSec = (float) Arr::get($data, 'run.time', 0);

        if ($runtimeSec <= 0) {
            $runtimeSec = max(0, microtime(true) - $startedAt);
        }

        return (int) round($runtimeSec * 1000);
    }

    private function collectStdout(array $data): string
    {
        return (string) (Arr::get($data, 'run.output') ?? Arr::get($data, 'run.stdout', ''));
    }

    private function collectStderr(array $data): string
    {
        $compileStderr = trim((string) Arr::get($data, 'compile.stderr', ''));
        $runStderr = trim((string) Arr::get($data, 'run.stderr', ''));

        if ($compileStderr && $runStderr) {
            return $compileStderr."\n".$runStderr;
        }

        return $compileStderr ?: $runStderr;
    }

    private function failRun(CodeRun $codeRun, string $message, Throwable $e): void
    {
        Log::error('Piston execution failed', [
            'run_id' => $codeRun->id,
            'error' => $e->getMessage(),
        ]);

        $codeRun->update([
            'status' => CodeRun::STATUS_FAILED,
            'stderr' => $message,
        ]);
    }
}
