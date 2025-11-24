<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ReservedSubdomain implements ValidationRule
{
    /**
     * @var array<string>
     */
    private array $blacklist = [
        'admin', 'api', 'auth', 'login', 'signup', 'oauth', 'backend', 'panel', 'root', 'system', 'internal', 'config',
        'www', 'app', 'beta', 'dev', 'test', 'staging', 'demo', 'static', 'cdn', 'assets',
        'mail', 'smtp', 'ftp', 'sftp', 'ssh', 'vpn',
        'support', 'help', 'docs', 'blog', 'status', 'news', 'community', 'space', 'cloud',
        'api-v1', 'api-v2', 'samdevx',
    ];

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (in_array(strtolower((string) $value), $this->blacklist, true)) {
            $fail('Bu nom tizim tomonidan band qilingan.');
        }
    }
}
