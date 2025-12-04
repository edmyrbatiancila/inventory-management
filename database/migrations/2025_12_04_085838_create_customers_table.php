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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();

            // Basic Information
            $table->string('customer_code')->unique(); // CUS-2025-001
            $table->enum('customer_type', ['individual', 'business', 'government', 'non_profit'])->default('business');
            $table->string('company_name')->nullable();
            $table->string('trade_name')->nullable();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->enum('status', ['active', 'inactive', 'suspended', 'prospect'])->default('prospect');

            // Contact Information
            $table->string('contact_person')->nullable();
            $table->string('contact_title')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('mobile')->nullable();
            $table->string('fax')->nullable();
            $table->string('website')->nullable();

            // Address Information - Billing
            $table->text('billing_address_line_1');
            $table->text('billing_address_line_2')->nullable();
            $table->string('billing_city');
            $table->string('billing_state_province')->nullable();
            $table->string('billing_postal_code')->nullable();
            $table->string('billing_country');

            // Address Information - Shipping
            $table->boolean('same_as_billing')->default(true);
            $table->text('shipping_address_line_1')->nullable();
            $table->text('shipping_address_line_2')->nullable();
            $table->string('shipping_city')->nullable();
            $table->string('shipping_state_province')->nullable();
            $table->string('shipping_postal_code')->nullable();
            $table->string('shipping_country')->nullable();

            // Business Information
            $table->string('tax_id')->nullable();
            $table->string('registration_number')->nullable();
            $table->text('business_description')->nullable();
            $table->json('industry_sectors')->nullable();
            $table->integer('established_year')->nullable();
            $table->enum('company_size', ['startup', 'small', 'medium', 'large', 'enterprise'])->nullable();

            // Financial Information
            $table->enum('payment_terms', ['cod', 'net_15', 'net_30', 'net_45', 'net_60', 'prepaid'])->default('net_30');
            $table->string('currency', 3)->default('USD');
            $table->decimal('credit_limit', 15, 2)->default(0);
            $table->decimal('current_balance', 15, 2)->default(0);
            $table->decimal('available_credit', 15, 2)->default(0);
            $table->enum('credit_status', ['good', 'watch', 'hold', 'collections'])->default('good');
            $table->enum('payment_method', ['bank_transfer', 'check', 'credit_card', 'cash', 'invoice'])->default('invoice');

            // Customer Performance & Analytics
            $table->decimal('customer_satisfaction_rating', 3, 2)->default(0.00);
            $table->integer('total_orders')->default(0);
            $table->decimal('total_order_value', 15, 2)->default(0);
            $table->decimal('average_order_value', 15, 2)->default(0);
            $table->decimal('lifetime_value', 15, 2)->default(0);
            $table->integer('payment_delay_days_average')->default(0);
            $table->integer('return_rate_percentage')->default(0);
            $table->integer('complaint_count')->default(0);

            // Sales Information
            $table->foreignId('assigned_sales_rep')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('customer_priority', ['low', 'normal', 'high', 'vip'])->default('normal');
            $table->enum('lead_source', ['website', 'referral', 'cold_call', 'trade_show', 'advertisement', 'social_media', 'other'])->nullable();
            $table->text('special_requirements')->nullable();
            $table->json('preferred_delivery_methods')->nullable();

            // Pricing & Discounts
            $table->enum('price_tier', ['standard', 'bronze', 'silver', 'gold', 'platinum'])->default('standard');
            $table->decimal('default_discount_percentage', 5, 2)->default(0.00);
            $table->boolean('volume_discount_eligible')->default(false);
            $table->boolean('seasonal_discount_eligible')->default(false);

            // Communication Preferences
            $table->json('communication_preferences')->nullable();
            $table->json('marketing_preferences')->nullable();
            $table->boolean('newsletter_subscription')->default(false);

            // Categories & Tags
            $table->json('customer_categories')->nullable();
            $table->json('tags')->nullable();

            // Internal Information
            $table->text('internal_notes')->nullable();
            $table->text('sales_notes')->nullable();
            $table->boolean('tax_exempt')->default(false);
            $table->string('tax_exempt_certificate')->nullable();

            // Relationship & Tracking
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('last_order_date')->nullable();
            $table->timestamp('last_contact_date')->nullable();
            $table->timestamp('first_purchase_date')->nullable();

            // Contract Information
            $table->date('contract_start_date')->nullable();
            $table->date('contract_end_date')->nullable();
            $table->enum('contract_type', ['one_time', 'short_term', 'long_term', 'enterprise'])->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index(['status', 'customer_type']);
            $table->index(['billing_country', 'billing_city']);
            $table->index(['credit_status']);
            $table->index(['customer_priority']);
            $table->index(['assigned_sales_rep']);
            $table->index(['created_at']);
            $table->index(['last_order_date']);
            $table->fullText(['company_name', 'trade_name', 'first_name', 'last_name', 'contact_person'], 'customers_search_fulltext');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
