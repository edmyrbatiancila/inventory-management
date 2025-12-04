<?php

namespace Database\Factories;

use App\Models\ContactLog;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ContactLog>
 */
class ContactLogFactory extends Factory
{
    protected $model = ContactLog::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $contactDate = $this->faker->dateTimeBetween('-6 months', 'now');
        $needsFollowUp = $this->faker->boolean(0.3);

        return [
            'contact_type' => $this->faker->randomElement(['call', 'email', 'meeting', 'visit', 'message']),
            'direction' => $this->faker->randomElement(['inbound', 'outbound']),
            'subject' => $this->faker->sentence(6),
            'description' => $this->faker->paragraph(3),
            'outcome' => $this->faker->randomElement(['successful', 'no_answer', 'follow_up_needed', 'resolved']),
            
            // Participants
            'contact_person_id' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'external_contact_person' => $this->faker->name(),
            'external_contact_email' => $this->faker->optional(0.7)->email(),
            'external_contact_phone' => $this->faker->optional(0.6)->phoneNumber(),
            
            // Timing
            'contact_date' => $contactDate,
            'duration_minutes' => $this->faker->numberBetween(5, 120),
            'follow_up_date' => $needsFollowUp ? 
                $this->faker->dateTimeBetween($contactDate, '+2 weeks') : null,
            
            // Additional Information
            'attachments' => $this->faker->optional(0.2)->randomElements([
                'meeting_notes.pdf', 
                'contract_proposal.docx', 
                'price_list.xlsx'
            ], rand(1, 2)),
            'priority' => $this->faker->randomElement(['low', 'normal', 'high']),
            'tags' => $this->faker->optional(0.4)->randomElements([
                'follow-up', 
                'urgent', 
                'pricing', 
                'contract', 
                'support'
            ], rand(1, 2)),
        ];
    }

    /**
     * Create contact log for supplier
     */
    public function forSupplier(?Supplier $supplier = null): static
    {
        $supplier = $supplier ?? Supplier::inRandomOrder()->first() ?? Supplier::factory()->create();
        
        return $this->state([
            'contactable_type' => Supplier::class,
            'contactable_id' => $supplier->id,
        ]);
    }

    /**
     * Create contact log for customer
     */
    public function forCustomer(?Customer $customer = null): static
    {
        $customer = $customer ?? Customer::inRandomOrder()->first() ?? Customer::factory()->create();
        
        return $this->state([
            'contactable_type' => Customer::class,
            'contactable_id' => $customer->id,
        ]);
    }

    /**
     * Create urgent contact log
     */
    public function urgent(): static
    {
        return $this->state([
            'priority' => 'urgent',
            'outcome' => 'follow_up_needed',
            'follow_up_date' => $this->faker->dateTimeBetween('now', '+3 days'),
        ]);
    }

    /**
     * Create follow-up needed contact log
     */
    public function needsFollowUp(): static
    {
        return $this->state([
            'outcome' => 'follow_up_needed',
            'follow_up_date' => $this->faker->dateTimeBetween('now', '+1 week'),
        ]);
    }
}
