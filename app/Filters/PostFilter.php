<?php

declare(strict_types=1);

namespace App\Filters;

use Illuminate\Contracts\Validation\Validator as ValidatorContract;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PostFilter
{
    private const ALLOWED_SORTS = ['latest', 'trending', 'popular', 'unanswered'];

    public function validate(Request $request): array
    {
        /** @var ValidatorContract $validator */
        $validator = Validator::make($request->all(), [
            'tag' => ['nullable', 'string', 'max:64'],
            'category' => ['nullable', 'string', 'max:64'],
            'user' => ['nullable', 'string', 'max:64'],
            'search' => ['nullable', 'string', 'min:3', 'max:80', 'regex:/^[\pL\pN\s\-\._@]+$/u'],
            'sort' => ['nullable', 'in:'.implode(',', self::ALLOWED_SORTS)],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        return $validator->validate();
    }

    public function apply(Builder $query, array $filters): Builder
    {
        $query->where('status', 'published')
            ->when($filters['tag'] ?? null, fn (Builder $builder, string $tag) => $builder->whereHas('tags', fn (Builder $tags) => $tags->where('slug', $tag))
            )
            ->when($filters['category'] ?? null, fn (Builder $builder, string $category) => $builder->whereHas('category', fn (Builder $categories) => $categories->where('slug', $category))
            )
            ->when($filters['user'] ?? null, fn (Builder $builder, string $username) => $builder->whereHas('user', fn (Builder $users) => $users->where('username', $username))
            )
            ->when($filters['search'] ?? null, function (Builder $builder, string $search): void {
                $escaped = $this->escapeLike($search);

                $builder->where(function (Builder $nested) use ($escaped): void {
                    $nested->where('title', 'LIKE', "%{$escaped}%")
                        ->orWhere('content_markdown', 'LIKE', "%{$escaped}%")
                        ->orWhereHas('tags', fn (Builder $tags) => $tags->where('name', 'LIKE', "%{$escaped}%"));
                });
            })
            ->tap(function (Builder $builder) use ($filters): void {
                $sort = $filters['sort'] ?? null;

                match ($sort) {
                    'latest' => $builder->orderByDesc('created_at'),
                    'trending' => $builder->orderByDesc('score')->orderByDesc('created_at'),
                    'popular' => $builder->orderByDesc('answers_count')->orderByDesc('score'),
                    'unanswered' => $builder->where('answers_count', 0)->orderByDesc('created_at'),
                    default => $builder->orderByDesc('score')->orderByDesc('id'),
                };
            });

        return $query;
    }

    public function cacheKey(array $filters, ?int $userId): ?string
    {
        if (! $this->isCacheable($filters)) {
            return null;
        }

        $normalized = [
            'user_id' => $userId ?? 'guest',
            'sort' => $filters['sort'] ?? 'default',
            'tag' => $filters['tag'] ?? '',
            'category' => $filters['category'] ?? '',
            'search' => $filters['search'] ?? '',
            'per_page' => (int) ($filters['per_page'] ?? 20),
        ];

        return implode('|', [
            'posts',
            'user:'.$normalized['user_id'],
            'sort:'.$normalized['sort'],
            'tag:'.$normalized['tag'],
            'category:'.$normalized['category'],
            'search:'.($normalized['search'] === '' ? '' : sha1($normalized['search'])),
            'per_page:'.$normalized['per_page'],
        ]);
    }

    private function isCacheable(array $filters): bool
    {
        if (($filters['search'] ?? null) !== null && ! $this->isCacheableSearch($filters['search'])) {
            return false;
        }

        if (($filters['sort'] ?? null) !== null && ! in_array($filters['sort'], self::ALLOWED_SORTS, true)) {
            return false;
        }

        return true;
    }

    private function isCacheableSearch(string $search): bool
    {
        return mb_strlen($search) <= 80;
    }

    private function escapeLike(string $value): string
    {
        return addcslashes($value, '%_\\');
    }
}
