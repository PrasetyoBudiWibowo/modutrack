<?php

namespace App\Helper;

use GeoIp2\Database\Reader;
use GeoIp2\Exception\AddressNotFoundException;

class GeoDetector
{
    public static function getDeviceLocation()
    {
        $databasePath = base_path('public/geoip2/GeoLite2-City.mmdb');

        // Cek apakah file benar-benar ada
        if (!file_exists($databasePath)) {
            return [
                'ip' => null,
                'device_info' => json_encode(['error' => 'GeoIP database file not found']),
                'location' => ['error' => 'GeoIP database file not found']
            ];
        }

        $reader = new Reader($databasePath);

        // Deteksi IP client
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'];
        }

        if ($ip === '::1') {
            $ip = '127.0.0.1';
        }

        try {
            $record = $reader->city($ip);

            $country = $record->country->name;
            $province = $record->mostSpecificSubdivision->name;
            $city = $record->city->name;

            return [
                'ip' => $ip,
                'device_info' => json_encode([
                    'country' => $country,
                    'province' => $province,
                    'city' => $city
                ]),
                'location' => [
                    'country' => $country,
                    'province' => $province,
                    'city' => $city
                ]
            ];
        } catch (AddressNotFoundException $e) {
            return [
                'ip' => $ip,
                'device_info' => json_encode(['error' => 'Location not found']),
                'location' => ['error' => 'Location not found']
            ];
        }
    }
}
