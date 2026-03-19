<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class MakeService extends Command
{
    protected $signature = 'make:service {name}';
    protected $description = 'Create a new service class';

    public function handle()
    {
        $name = $this->argument('name');
        $path = app_path("Service/{$name}.php");

        if (!File::exists(app_path('Service'))) {
            File::makeDirectory(app_path('Service'), 0755, true);
        }

        if (File::exists($path)) {
            $this->error('Service already exists!');
            return;
        }

        // isi template
        $stub = "<?php

namespace App\Service;

class {$name}
{
    //
}";

        File::put($path, $stub);

        $this->info("Service {$name} created successfully.");
    }
}
