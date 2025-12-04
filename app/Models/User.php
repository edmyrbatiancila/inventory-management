<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'type',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relationships
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function approvedStockMovements()
    {
        return $this->hasMany(StockMovement::class, 'approved_by');
    }

    public function createdSuppliers()
    {
        return $this->hasMany(Supplier::class, 'created_by');
    }

    public function updatedSuppliers()
    {
        return $this->hasMany(Supplier::class, 'updated_by');
    }

    public function createdCustomers()
    {
        return $this->hasMany(Customer::class, 'created_by');
    }

    public function updatedCustomers()
    {
        return $this->hasMany(Customer::class, 'updated_by');
    }

    public function managedCustomers()
    {
        return $this->hasMany(Customer::class, 'assigned_sales_rep');
    }

    public function contactLogs()
    {
        return $this->hasMany(ContactLog::class, 'contact_person_id');
    }

    // Helper Methods
    /**
     * Check if the user is an admin.
     */
    public function isAdmin(): bool
    {
        // Check if user has admin type (preferred method)
        if (isset($this->type) && $this->type === 'admin') {
            return true;
        }
        
        // Fallback to email check (for backward compatibility)
        return $this->email === 'admin@gmail.com';
    }
}
