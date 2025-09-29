<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categories extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function food(){
      return $this->hasMany(Food::class);
    }
    public function restaurent_category(){
      return $this->hasMany(Res_Cat::class);
    }
}
