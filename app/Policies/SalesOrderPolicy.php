<?php

namespace App\Policies;

use App\Models\SalesOrder;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SalesOrderPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, SalesOrder $salesOrder): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, SalesOrder $salesOrder): bool
    {
        // Admins can edit any sales order in editable status
        if ($this->isAdmin($user)) {
            return in_array($salesOrder->status, ['draft', 'pending_approval']);
        }
        
        // Regular users can only edit their own draft sales orders
        return $salesOrder->status === 'draft' &&
                $salesOrder->created_by === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, SalesOrder $salesOrder): bool
    {
        // Admins can delete any draft sales order
        if ($this->isAdmin($user)) {
            return $salesOrder->status === 'draft';
        }
        
        // Regular users can only delete their own draft sales orders
        return $salesOrder->status === 'draft' &&
                $salesOrder->created_by === $user->id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, SalesOrder $salesOrder): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, SalesOrder $salesOrder): bool
    {
        return false;
    }

    /**
     * Determine whether the user can approve the sales order.
     */
    public function approve(User $user, SalesOrder $salesOrder): bool
    {
        // Admins and authorized users can approve pending approval orders
        return $salesOrder->status === 'pending_approval';
    }

    /**
     * Determine whether the user can confirm the sales order.
     */
    public function confirm(User $user, SalesOrder $salesOrder): bool
    {
        // Admins and authorized users can confirm approved or draft orders
        return in_array($salesOrder->status, ['approved', 'draft']);
    }

    /**
     * Determine whether the user can fulfill the sales order.
     */
    public function fulfill(User $user, SalesOrder $salesOrder): bool
    {
        // Admins and authorized users can fulfill confirmed or partially fulfilled orders
        return in_array($salesOrder->status, ['confirmed', 'partially_fulfilled']);
    }

    /**
     * Determine whether the user can ship the sales order.
     */
    public function ship(User $user, SalesOrder $salesOrder): bool
    {
        // Admins and authorized users can ship fully fulfilled orders
        return $salesOrder->status === 'fully_fulfilled';
    }

    /**
     * Determine whether the user can mark as delivered the sales order.
     */
    public function deliver(User $user, SalesOrder $salesOrder): bool
    {
        // Admins and authorized users can deliver shipped orders
        return $salesOrder->status === 'shipped';
    }

    /**
     * Determine whether the user can cancel the sales order.
     */
    public function cancel(User $user, SalesOrder $salesOrder): bool
    {
        // Admins and authorized users can cancel orders that aren't delivered, closed, or already cancelled
        return !in_array($salesOrder->status, ['delivered', 'closed', 'cancelled']);
    }

    /**
     * Check if the user is an admin.
     * Uses the User model's isAdmin method for consistency.
     */
    private function isAdmin(User $user): bool
    {
        return $user->isAdmin();
    }
}
