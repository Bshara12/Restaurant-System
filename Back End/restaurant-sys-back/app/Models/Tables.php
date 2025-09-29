<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tables extends Model
{
    use HasFactory;
    protected $guarded = [];

  
    public function customer(){
      return $this->belongsTo(Customer::class);
    }
  
    public function music_table(){
      return $this->hasMany(Music_Table::class);
    }
    public function reastaurant(){
      return $this->belongsTo(Reastaurant::class);
    }
}
