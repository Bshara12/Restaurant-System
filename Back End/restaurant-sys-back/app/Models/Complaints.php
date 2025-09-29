<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaints extends Model
{
    use HasFactory;
    protected $guarded = [];

   public function customer(){
    return $this->belongsTo(Customer::class);
   }
   public function employee(){
    return $this->belongsTo(Employees::class);
   }

}
