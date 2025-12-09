<?php

// file: app/Services/CodeRun/CodeRunner.php

namespace App\Services\CodeRun;

use App\Models\User;

interface CodeRunner
{
    /**
     * @return array{stdout:string,stderr:string,code:int,time_ms:int}
     */
    public function run(User $user, string $language, string $source): array;
}
