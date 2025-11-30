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
        return $salesOrder->status === 'draft' &&
                $salesOrder->created_by === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, SalesOrder $salesOrder): bool
    {
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
        // Allow any authenticated user to approve for now
        // In production, you'd check for specific roles/permissions
        return $salesOrder->status === 'pending_approval';
    }

    /**
     * Determine whether the user can confirm the sales order.
     */
    public function confirm(User $user, SalesOrder $salesOrder): bool
    {
        // Can confirm if approved or draft
        return in_array($salesOrder->status, ['approved', 'draft']);
    }

    /**
     * Determine whether the user can fulfill the sales order.
     */
    public function fulfill(User $user, SalesOrder $salesOrder): bool
    {
        // Can fulfill if confirmed or partially fulfilled
        return in_array($salesOrder->status, ['confirmed', 'partially_fulfilled']);
    }

    /**
     * Determine whether the user can ship the sales order.
     */
    public function ship(User $user, SalesOrder $salesOrder): bool
    {
        // Can ship if fully fulfilled
        return $salesOrder->status === 'fully_fulfilled';
    }

    /**
     * Determine whether the user can mark as delivered the sales order.
     */
    public function deliver(User $user, SalesOrder $salesOrder): bool
    {
        // Can deliver if shipped
        return $salesOrder->status === 'shipped';
    }

    /**
     * Determine whether the user can cancel the sales order.
     */
    public function cancel(User $user, SalesOrder $salesOrder): bool
    {
        // Can cancel if not yet delivered or closed
        return !in_array($salesOrder->status, ['delivered', 'closed', 'cancelled']);
    }
}
