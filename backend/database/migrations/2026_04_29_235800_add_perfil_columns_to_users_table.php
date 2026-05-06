<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('bio',       255)->nullable()->after('email');
            $table->string('ubicacion', 100)->nullable()->after('bio');
            $table->string('foto',      255)->nullable()->after('ubicacion');
            $table->string('foto_portada', 255)->nullable()->after('foto');
            $table->string('google_id', 100)->nullable()->unique()->after('foto_portada');
            $table->string('provider',   50)->default('local')->after('google_id');
            $table->text('google_token')->nullable()->after('provider');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'bio', 'ubicacion', 'foto', 'foto_portada',
                'google_id', 'provider', 'google_token'
            ]);
        });
    }
};