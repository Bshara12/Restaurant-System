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
        Schema::create('listorder_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listorders_id')
            ->constrained('listorders')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();
            $table->foreignId('food_id')
            ->constrained('food')
            ->cascadeOnDelete()
            ->cascadeOnUpdate();
            $table->integer('quantity')->default(1);
            $table->text('description');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('listorder_items');
    }
};
