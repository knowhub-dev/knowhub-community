<?php

// file: app/Http/Controllers/Auth/OAuthController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class OAuthController extends Controller
{
    private const STATE_TTL_SECONDS = 300;

    public function redirectGoogle(Request $request): RedirectResponse
    {
        return $this->redirectToProvider($request, 'google');
    }

    public function handleGoogleCallback(Request $request): RedirectResponse
    {
        return $this->handleProviderCallback($request, 'google');
    }

    public function redirectGithub(Request $request): RedirectResponse
    {
        return $this->redirectToProvider($request, 'github');
    }

    public function handleGithubCallback(Request $request): RedirectResponse
    {
        return $this->handleProviderCallback($request, 'github');
    }

    protected function redirectToProvider(Request $request, string $provider): RedirectResponse
    {
        $redirectPath = $this->sanitizeRedirect($request->query('redirect'));
        $state = $this->encodeState($redirectPath);
        $driver = Socialite::driver($provider)->stateless();

        if ($state !== null) {
            $driver = $driver->with(['state' => $state]);
        }

        return $driver->redirect();
    }

    protected function handleProviderCallback(Request $request, string $provider): RedirectResponse
    {
        try {
            $oauthUser = Socialite::driver($provider)->stateless()->user();

            $name = $provider === 'github'
                ? ($oauthUser->getNickname() ?: $oauthUser->getName())
                : $oauthUser->getName();

            $redirect = $this->sanitizeRedirect($this->decodeState($request->query('state')));

            return $this->issueToken(
                $provider,
                (string) $oauthUser->getId(),
                $name,
                $oauthUser->getEmail(),
                $oauthUser->getAvatar(),
                $redirect
            );
        } catch (\Throwable $e) {
            Log::error('OAuth callback failed', [
                'provider' => $provider,
                'message' => $e->getMessage(),
            ]);

            return $this->redirectWithError($provider, 'authentication_failed', $request->query('state'));
        }
    }

    protected function issueToken(
        string $provider,
        string $providerId,
        ?string $name,
        ?string $email,
        ?string $avatar,
        ?string $redirect
    ): RedirectResponse {
        $user = User::where('provider', $provider)
            ->where('provider_id', $providerId)
            ->first();

        $resolvedEmail = $email ?: $this->buildFallbackEmail($provider, $providerId);

        if (! $user) {
            $user = User::create([
                'provider' => $provider,
                'provider_id' => $providerId,
                'name' => $name ?: $this->buildFallbackName($provider),
                'username' => $this->generateUniqueUsername($name ?: $provider),
                'email' => $resolvedEmail,
                'avatar_url' => $avatar,
                'password' => null,
            ]);
        } else {
            $user->fill(array_filter([
                'name' => $name ?: $user->name,
                'email' => $resolvedEmail,
                'avatar_url' => $avatar ?: $user->avatar_url,
            ], static fn ($value) => $value !== null));
            $user->save();
        }

        $token = $user->createToken('auth')->plainTextToken;

        return redirect()->away($this->buildRedirectUrl([
            'provider' => $provider,
            'redirect' => $redirect,
            'status' => 'success',
        ]))->withCookie($this->issueAuthCookie($token));
    }

    protected function redirectWithError(string $provider, string $error, ?string $encodedState = null): RedirectResponse
    {
        $redirect = $this->sanitizeRedirect($this->decodeState($encodedState));

        return redirect()->away($this->buildRedirectUrl([
            'error' => $error,
            'provider' => $provider,
            'redirect' => $redirect,
        ]));
    }

    protected function buildRedirectUrl(array $params): string
    {
        $base = rtrim(config('app.frontend_url', config('app.url')), '/');
        $query = http_build_query(array_filter($params, static fn ($value) => $value !== null && $value !== ''));

        return $base.'/auth/oauth-callback'.($query ? '?'.$query : '');
    }

    protected function encodeState(?string $redirect): ?string
    {
        if (! $redirect) {
            return null;
        }

        $payload = [
            'redirect' => $redirect,
            'nonce' => Str::random(16),
            'ts' => time(),
        ];

        $payload['sig'] = hash_hmac('sha256', $payload['redirect'].'|'.$payload['nonce'].'|'.$payload['ts'], config('app.key'));

        return base64_encode(json_encode($payload));
    }

    protected function decodeState(?string $encoded): ?string
    {
        if (! $encoded) {
            return null;
        }

        $decoded = json_decode(base64_decode($encoded, true) ?: '', true);

        if (! is_array($decoded)) {
            return null;
        }

        $ts = $decoded['ts'] ?? 0;
        $sig = $decoded['sig'] ?? '';
        $nonce = $decoded['nonce'] ?? '';
        $redirect = $decoded['redirect'] ?? null;

        if (! $redirect || ! is_string($redirect)) {
            return null;
        }

        if (abs(time() - (int) $ts) > self::STATE_TTL_SECONDS) {
            Log::warning('OAuth state expired', ['ts' => $ts]);

            return null;
        }

        $expected = hash_hmac('sha256', $redirect.'|'.$nonce.'|'.$ts, config('app.key'));
        if (! hash_equals($expected, (string) $sig)) {
            Log::warning('OAuth state signature mismatch');

            return null;
        }

        return $redirect;
    }

    protected function sanitizeRedirect(?string $redirect): ?string
    {
        if (! $redirect || ! str_starts_with($redirect, '/')) {
            return null;
        }

        return $redirect;
    }

    protected function buildFallbackEmail(string $provider, string $providerId): string
    {
        return sprintf('%s_%s@users.knowhub.uz', $provider, $providerId);
    }

    protected function buildFallbackName(string $provider): string
    {
        return Str::title($provider).' User';
    }

    protected function generateUniqueUsername(string $name): string
    {
        $base = Str::lower(Str::slug($name ?: 'user')) ?: 'user';
        $candidate = $base;
        $suffix = 1;

        while (User::where('username', $candidate)->exists()) {
            $candidate = $base.'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }

    private function issueAuthCookie(string $token)
    {
        return cookie(
            'auth_token',
            $token,
            60 * 24 * 30,
            '/',
            config('session.domain'),
            (bool) config('session.secure', true),
            true,
            false,
            config('session.same_site', 'lax')
        );
    }
}
