<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Food extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function category(){
      return $this->belongsTo(Categories::class);
    }
    public function reastaurant(){
      return $this->belongsTo(Reastaurant::class);
    }
    public function listorder_item(){
      return $this->hasMany(listorderItem::class);
    }
}
