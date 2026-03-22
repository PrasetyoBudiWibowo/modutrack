<?php

namespace App\Helper;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Formatter\LineFormatter;

class AppLogger
{
    public static function getLogger($name = 'app')
    {
        $log = new Logger($name);

        $formatter = new LineFormatter(null, null, true, true);

        $logPath = base_path('logs/app.log');

        $fileHandler = new StreamHandler($logPath, Logger::DEBUG);
        $fileHandler->setFormatter($formatter);
        $log->pushHandler($fileHandler);

        $stdoutHandler = new StreamHandler('php://stdout', Logger::DEBUG, true);
        $stdoutHandler->setFormatter($formatter);
        $log->pushHandler($stdoutHandler);

        return $log;
    }
}
