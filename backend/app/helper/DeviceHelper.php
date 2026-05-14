<?php

namespace App\Helper;

use DeviceDetector\DeviceDetector;

class DeviceHelper
{
    public static function detectDevice($userAgent)
    {
        $deviceType = 'UNKNOWN';
        $deviceName = 'Tidak Teridentifikasi';
        $browserName = 'Tidak Teridentifikasi';
        $browserVersion = 'Tidak Diketahui';

        if (!$userAgent) {
            return [
                'deviceType' => $deviceType,
                'deviceName' => $deviceName,
                'browser' => $browserName,
                'browserVersion' => $browserVersion
            ];
        }

        $deviceDetector = new DeviceDetector($userAgent);
        $deviceDetector->parse();

        if ($deviceDetector->isBot()) {
            $deviceType = 'BOT';
            $deviceName = $deviceDetector->getBot()['name'] ?? 'Bot';
        } else {

            $brand = $deviceDetector->getBrandName() ?? '';
            $model = $deviceDetector->getModel() ?? '';

            if ($deviceDetector->isMobile()) {
                $deviceType = 'SMARTPHONE';
                $deviceName = trim($brand . ' ' . $model) ?: 'Smartphone';
            } elseif ($deviceDetector->isTablet()) {
                $deviceType = 'TABLET';
                $deviceName = trim($brand . ' ' . $model) ?: 'Tablet';
            } elseif ($deviceDetector->isDesktop()) {
                $deviceType = 'DESKTOP / PC';
                $deviceName = 'Desktop atau PC';
            }
        }

        $client = $deviceDetector->getClient();

        if (!empty($client)) {
            $browserName = $client['name'] ?? 'Unknown';
            $browserVersion = $client['version'] ?? 'Unknown';
        }

        return [
            'deviceType' => $deviceType,
            'deviceName' => $deviceName,
            'browser' => $browserName,
            'browserVersion' => $browserVersion
        ];
    }
}
