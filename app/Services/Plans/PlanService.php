<?php

namespace App\Services\Plans;

use App\Support\Settings;

class PlanService
{
    /**
     * Get merged plans (config + overrides from settings).
     *
     * @return array<int,array<string,mixed>>
     */
    public function all(): array
    {
        $configPlans = config('plans.plans', []);
        $customPlans = $this->customPlans();
        $customById = collect($customPlans)->keyBy('id');

        $plans = [];
        foreach ($configPlans as $id => $limits) {
            $custom = $customById->get($id, []);
            $plans[] = $this->buildPlan($id, $limits, $custom);
        }

        // Add any custom plans that are not in config (if admins created new tiers)
        foreach ($customById as $id => $custom) {
            if (! array_key_exists($id, $configPlans)) {
                $plans[] = $this->buildPlan($id, [], $custom);
            }
        }

        return $plans;
    }

    /**
     * Persist plan definitions (overrides).
     *
     * @param  array<int,array<string,mixed>>  $plans
     * @return array<int,array<string,mixed>>
     */
    public function save(array $plans): array
    {
        Settings::set('plans.custom', array_values($plans), 'json');

        return $this->all();
    }

    /**
     * @return array<int,array<string,mixed>>
     */
    private function customPlans(): array
    {
        $data = Settings::get('plans.custom', []);

        return is_array($data) ? $data : [];
    }

    /**
     * @param  array<string,mixed>  $limits
     * @param  array<string,mixed>  $custom
     */
    private function buildPlan(string $id, array $limits, array $custom): array
    {
        $defaults = $this->defaultPlanMeta($id);

        return [
            'id' => $id,
            'name' => $custom['name'] ?? $defaults['name'],
            'currency' => $custom['currency'] ?? $defaults['currency'],
            'price_monthly' => (float) ($custom['price_monthly'] ?? $defaults['price_monthly']),
            'price_yearly' => (float) ($custom['price_yearly'] ?? $defaults['price_yearly']),
            'description' => $custom['description'] ?? $defaults['description'],
            'features' => $this->normalizeFeatures($custom['features'] ?? $defaults['features']),
            'limits' => $custom['limits'] ?? $limits,
            'highlight' => (bool) ($custom['highlight'] ?? $defaults['highlight']),
          ];
    }

    /**
     * @return array<int,string>
     */
    private function normalizeFeatures(array $features): array
    {
        return collect($features)
            ->filter(fn ($item) => is_string($item) && trim($item) !== '')
            ->map(fn (string $item) => trim($item))
            ->values()
            ->all();
    }

    /**
     * Default marketing/meta data for plans (in absence of admin overrides).
     *
     * @return array<string,mixed>
     */
    private function defaultPlanMeta(string $id): array
    {
        return match ($id) {
            'pro' => [
                'name' => 'Pro',
                'currency' => 'UZS',
                'price_monthly' => 99000,
                'price_yearly' => 990000,
                'description' => 'Faol ishlab chiquvchilar uchun tezkor kvotalar va prioritet xizmat.',
                'features' => [
                    '5 tagacha mini-server',
                    'Prioritet code execution va tezroq timeoutlar',
                    '10 GB yuklash kvotasi',
                    'Communityda pro nishoni',
                ],
                'highlight' => true,
            ],
            'legend' => [
                'name' => 'Legend',
                'currency' => 'UZS',
                'price_monthly' => 199000,
                'price_yearly' => 1990000,
                'description' => 'Katta jamoa va uzoq ishga tushirishlar uchun kengaytirilgan resurslar.',
                'features' => [
                    '10 tagacha mini-server',
                    'Eng yuqori ustuvorlik va 30s timeout',
                    '20 GB yuklash kvotasi',
                    'Legend nishoni va yopiq beta funksiyalar',
                ],
                'highlight' => true,
            ],
            default => [
                'name' => ucfirst($id),
                'currency' => 'UZS',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'description' => 'Boshlovchilar uchun bepul rejim.',
                'features' => [
                    '1 ta mini-server',
                    'Asosiy code execution (5s timeout)',
                    '2 MB yuklash kvotasi',
                ],
                'highlight' => false,
            ],
        };
    }
}
