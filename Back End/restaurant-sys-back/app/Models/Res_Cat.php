<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Res_Cat extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function restaurant(){
        return $this->belongsTo(Reastaurant::class);
    }

    public function category(){
        return $this->belongsTo(Categories::class,'Category_id','id');
    }

    public function createCategoryForRestaurant($restaurantId, $categoryId) {
        // Check if the relationship already exists
        $exists = $this->where('restaurant_id', $restaurantId)
                       ->where('category_id', $categoryId)
                       ->exists();

        if (!$exists) {
            // Create a new entry in the Res_Cat table
            return $this->create([
                'restaurant_id' => $restaurantId,
                'category_id' => $categoryId,
            ]);
        }

        return null; // or throw an exception if needed
    }
}
