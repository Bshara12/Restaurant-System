<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// use Laravel\Prompts\Table;

class Customer extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function Table(){
      return $this->hasOne(Tables::class);
    }
    public function review(){
      return $this->hasMany(Review::class);
    }
    public function parking(){
      return $this->hasOne(Parking::class);
    }
    public function complaints(){
      return $this->hasMany(Complaints::class);
    }

    public function order_table(){
      return $this->hasMany(Order_Table::class);
    }
    
    public function employeecustomer(){
      return $this->hasMany(EmployeeCustomer::class);
    }
}
