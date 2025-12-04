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
        Schema::create('contact_logs', function (Blueprint $table) {
            $table->id();

            // Polymorphic relationship
            $table->morphs('contactable');

            // Contact Information
            $table->enum('contact_type', ['call', 'email', 'meeting', 'visit', 'message', 'other'])->default('call');
            $table->enum('direction', ['inbound', 'outbound'])->default('outbound');
            $table->string('subject');
            $table->text('description');
            $table->enum('outcome', ['successful', 'no_answer', 'follow_up_needed', 'resolved', 'escalated'])->nullable();

            // Participants
            $table->foreignId('contact_person_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('external_contact_person')->nullable();
            $table->string('external_contact_email')->nullable();
            $table->string('external_contact_phone')->nullable();

            // Timing
            $table->timestamp('contact_date');
            $table->integer('duration_minutes')->nullable();
            $table->timestamp('follow_up_date')->nullable();

            // Additional Information
            $table->json('attachments')->nullable();
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->json('tags')->nullable();

            $table->timestamps();

            // Indexes (morphs already creates contactable_type, contactable_id index)
            $table->index(['contact_type', 'contact_date']);
            $table->index(['contact_person_id']);
            $table->index(['follow_up_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contact_logs');
    }
};
