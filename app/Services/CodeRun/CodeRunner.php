<?php

// file: app/Services/CodeRun/CodeRunner.php

namespace App\Services\CodeRun;

use App\Models\CodeRun;
use App\Models\User;

interface CodeRunner
{
    public function submit(
        User $user,
        string $language,
        string $source,
        ?int $postId = null,
        ?int $commentId = null
    ): CodeRun;

    /**
     * @return void
     */
    public function execute(CodeRun $codeRun): void;
}
