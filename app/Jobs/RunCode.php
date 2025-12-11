<?php

namespace App\Jobs;

use App\Models\CodeRun;
use App\Services\CodeRun\PistonCodeRunner;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class RunCode implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly CodeRun $codeRun)
    {
    }

    public function handle(PistonCodeRunner $codeRunner): void
    {
        try {
            $codeRunner->execute($this->codeRun);
        } catch (Throwable $e) {
            Log::error('Code run job failed', [
                'run_id' => $this->codeRun->id,
                'error' => $e->getMessage(),
            ]);

            $this->codeRun->update([
                'status' => CodeRun::STATUS_FAILED,
                'stderr' => $this->codeRun->stderr ?: 'An unexpected error occurred during execution.',
            ]);
        }
    }
}
