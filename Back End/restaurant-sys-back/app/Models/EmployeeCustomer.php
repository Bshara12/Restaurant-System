<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeCustomer extends Model
{
    use HasFactory;
     protected $table = 'employee_customer'; 
       protected $fillable = [
        'customer_id',
        'restaurant_id',
        'message',
    ];
    public function employee(){
      return $this->belongsTo(Employees::class);
    }
      public function customer(){
      return $this->belongsTo(Customer::class);
    }
}
