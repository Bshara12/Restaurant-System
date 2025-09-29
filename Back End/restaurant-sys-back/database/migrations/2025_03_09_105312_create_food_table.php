<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('food', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->double('price');
            $table->string('discription');
            $table->foreignId('categories_id')
            ->constrained('categories')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();
            $table->foreignId('reastaurants_id')
            ->constrained('reastaurants')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();
            $table->double('discount');
            $table->time('time-to-make');
            $table->string('image');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('food');
    }
};
