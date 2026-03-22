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

        $deviceDetector = new DeviceDetector($userAgent);
        $deviceDetector->parse();

        if ($deviceDetector->isBot()) {
            $deviceType = 'BOT';
            $deviceName = $deviceDetector->getBot()['name'] ?? 'Bot';
        } else {
            if ($deviceDetector->isMobile()) {
                $deviceType = 'SMARTPHONE';
                $deviceName = $deviceDetector->getBrandName() . ' ' . $deviceDetector->getModel();
            } elseif ($deviceDetector->isTablet()) {
                $deviceType = 'TABLET';
                $deviceName = $deviceDetector->getBrandName() . ' ' . $deviceDetector->getModel();
            } elseif ($deviceDetector->isDesktop()) {
                $deviceType = 'DESKTOP / PC';
                $deviceName = 'Desktop atau PC';
            }
        }

        if ($deviceDetector->getClient()) {
            $browserName = $deviceDetector->getClient()['name'];
            $browserVersion = $deviceDetector->getClient()['version'];
        }

        return [
            'deviceType' => $deviceType,
            'deviceName' => $deviceName,
            'browser' => $browserName,
            'browserVersion' => $browserVersion
        ];
    }
}
