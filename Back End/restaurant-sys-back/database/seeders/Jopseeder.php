<?php

namespace Database\Seeders;

use App\Models\Jobs;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class Jopseeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jobs = ['Waiters','Chef','DJ','Parking'];
        for($i=0;$i<4;$i++){
          Jobs::query()->create([
            'name' => $jobs[$i],
          ]);
        }
    }
}
