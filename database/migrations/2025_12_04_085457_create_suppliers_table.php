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
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();

            // Basic Information
            $table->string('supplier_code')->unique(); // SUP-2025-001
            $table->string('company_name');
            $table->string('trade_name')->nullable();
            $table->enum('supplier_type', ['manufacturer', 'distributor', 'wholesaler', 'retailer', 'service_provider'])->default('distributor');
            $table->enum('status', ['active', 'inactive', 'blacklisted', 'pending_approval'])->default('pending_approval');

            // Contact Information
            $table->string('contact_person')->nullable();
            $table->string('contact_title')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('mobile')->nullable();
            $table->string('fax')->nullable();
            $table->string('website')->nullable();

            // Address Information
            $table->text('address_line_1');
            $table->text('address_line_2')->nullable();
            $table->string('city');
            $table->string('state_province')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country');

            // Business Information
            $table->string('tax_id')->nullable();
            $table->string('registration_number')->nullable();
            $table->text('business_description')->nullable();
            $table->json('certifications')->nullable();
            $table->integer('established_year')->nullable();

            // Financial Information
            $table->enum('payment_terms', ['cod', 'net_15', 'net_30', 'net_45', 'net_60', 'net_90', 'prepaid'])->default('net_30');
            $table->string('currency', 3)->default('USD');
            $table->decimal('credit_limit', 15, 2)->default(0);
            $table->decimal('current_balance', 15, 2)->default(0);
            $table->enum('payment_method', ['bank_transfer', 'check', 'credit_card', 'cash', 'letter_of_credit'])->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_routing_number')->nullable();

            // Performance Metrics
            $table->decimal('overall_rating', 3, 2)->default(0.00);
            $table->decimal('quality_rating', 3, 2)->default(0.00);
            $table->decimal('delivery_rating', 3, 2)->default(0.00);
            $table->decimal('service_rating', 3, 2)->default(0.00);
            $table->integer('total_orders')->default(0);
            $table->decimal('total_order_value', 15, 2)->default(0);
            $table->decimal('average_order_value', 15, 2)->default(0);
            $table->integer('on_time_delivery_percentage')->default(0);
            $table->integer('quality_issues_count')->default(0);

            // Lead Times (in days)
            $table->integer('standard_lead_time')->nullable();
            $table->integer('rush_order_lead_time')->nullable();
            $table->decimal('minimum_order_value', 15, 2)->nullable();

            // Compliance & Documentation
            $table->boolean('tax_exempt')->default(false);
            $table->json('required_documents')->nullable();
            $table->date('insurance_expiry')->nullable();
            $table->json('shipping_methods')->nullable();

            // Categories & Products
            $table->json('product_categories')->nullable();
            $table->json('tags')->nullable();

            // Internal Notes
            $table->text('internal_notes')->nullable();
            $table->text('special_instructions')->nullable();

            // Relationship & Tracking
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('last_order_date')->nullable();
            $table->timestamp('last_contact_date')->nullable();

            // Contract Information
            $table->date('contract_start_date')->nullable();
            $table->date('contract_end_date')->nullable();
            $table->enum('contract_type', ['one_time', 'short_term', 'long_term', 'preferred_vendor'])->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index(['status', 'supplier_type']);
            $table->index(['country', 'city']);
            $table->index(['overall_rating']);
            $table->index(['created_at']);
            $table->index(['last_order_date']);
            $table->fullText(['company_name', 'trade_name', 'contact_person'], 'suppliers_search_fulltext');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
