<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employees extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function job(){
      return $this->belongsTo(Jobs::class);
    }
    public function complaints(){
      return $this->hasMany(Complaints::class);
    }
    public function user(){
      return $this->belongsTo(User::class);
    }
    public function restaurant(){
      return $this->belongsTo(Reastaurant::class,'reastaurant_id');
    }
    
}
