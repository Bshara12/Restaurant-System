<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class listorder extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function listorderItem(){
      return $this->hasMany(listorderItem::class);
    }
     public function Order(){
      return $this->hasOne(Order::class);
     }
}
