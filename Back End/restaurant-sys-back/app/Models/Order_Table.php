<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order_Table extends Model
{
    use HasFactory;
    protected $guarded = [];


    public function customer(){
      return $this->belongsTo(Customer::class);
    }
    public function table(){
      return $this->belongsTo(Tables::class);
    }
}
