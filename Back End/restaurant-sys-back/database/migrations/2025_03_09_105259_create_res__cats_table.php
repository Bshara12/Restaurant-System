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
        Schema::create('res__cats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')
            ->constrained('reastaurants')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();
            $table->foreignId('Category_id')
            ->constrained('categories')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('res__cats');
    }
};
