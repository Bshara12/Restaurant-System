<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jobs extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function employee(){
      return $this->hasMany(Employees::class);
    }
}
