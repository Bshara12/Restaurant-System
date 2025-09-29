<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class listorderItem extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function food(){
      return $this->belongsTo(Food::class);
    }
    public function listorder(){
      return $this->belongsTo(listorder::class);
    }
}
