<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reastaurant extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function user(){
      return $this->belongsTo(User::class);
    }
    public function restaurent_category(){
      return $this->hasMany(Res_Cat::class);
    }
    public function food(){
      return $this->hasMany(Food::class);
    }
    public function review(){
      return $this->hasMany(Review::class);
    }
    public function employee(){
      return $this->hasMany(Employees::class);
    }
    public function table(){
      return $this->hasMany(Tables::class);
    }

    public function music(){
      return $this->hasMany(Music::class);
    }

    public function employeecustomer(){
      return $this->hasMany(EmployeeCustomer::class);
    }
}
