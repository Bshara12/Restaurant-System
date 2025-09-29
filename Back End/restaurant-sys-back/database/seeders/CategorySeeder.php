<?php

namespace Database\Seeders;

use App\Models\Categories;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Appetizers',
            'Main Course',
            'Desserts',
            'Drinks',
            'Salads',
            'Soups',
            'Sandwiches',
            'Seafood',
            'Grill',
            'Pasta',
            'Pizza',
            'Breakfast',
        ];

        foreach ($categories as $category) {
            Categories::create([
                'name' => $category,
            ]);
        }
    }
}