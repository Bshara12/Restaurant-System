<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function order_table(){
      return $this->hasMany(Order_Table::class);
    }
    public function listorder(){
      return $this->belongsTo(listorder::class);
    }
}
