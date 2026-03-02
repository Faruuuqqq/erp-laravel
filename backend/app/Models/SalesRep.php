<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalesRep extends Model
{
    use SoftDeletes;

    protected $table = 'sales_reps';

    protected $fillable = ['name', 'phone', 'email', 'address', 'status'];
}
