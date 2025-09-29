<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Music extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function music_table(){
      return $this->hasMany(Music_Table::class);
    }
    public function restaurant(){
      return $this->belongsTo(Reastaurant::class);
    }
}
