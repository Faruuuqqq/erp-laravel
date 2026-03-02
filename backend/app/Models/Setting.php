<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'group',
        'type',
        'label',
        'description',
    ];

    protected $casts = [
        'value' => 'json',
    ];

    /**
     * Get setting value by key
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = self::where('key', $key)->first();

        if (!$setting) {
            return $default;
        }

        return $setting->value;
    }

    /**
     * Set setting value by key
     *
     * @param string $key
     * @param mixed $value
     * @param string $group
     * @param string $type
     * @return Setting
     */
    public static function set(string $key, mixed $value, string $group = 'general', string $type = 'string'): Setting
    {
        return self::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'group' => $group,
                'type' => $type,
            ]
        );
    }

    /**
     * Get settings by group
     *
     * @param string $group
     * @return array
     */
    public static function getByGroup(string $group): array
    {
        return self::where('group', $group)
            ->pluck('value', 'key')
            ->toArray();
    }

    /**
     * Get all settings organized by group
     *
     * @return array
     */
    public static function getAll(): array
    {
        $settings = self::all()->groupBy('group');
        
        $result = [];
        foreach ($settings as $group => $items) {
            $result[$group] = $items->mapWithKeys(function ($item) {
                return [$item->key => $item->value];
            })->toArray();
        }
        
        return $result;
    }
}
