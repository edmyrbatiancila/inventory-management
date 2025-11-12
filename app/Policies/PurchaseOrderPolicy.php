<?php

namespace App\Policies;

use App\Models\PurchaseOrder;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PurchaseOrderPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Allow authenticated users to view purchase orders list
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, PurchaseOrder $purchaseOrder): bool
    {
        // Allow authenticated users to view purchase orders
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Allow authenticated users to create purchase orders
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, PurchaseOrder $purchaseOrder): bool
    {
        // Allow creators to update draft purchase orders
        // Note: Assuming all authenticated users can edit draft POs for now
        return $purchaseOrder->status === 'draft' && 
               $purchaseOrder->created_by === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, PurchaseOrder $purchaseOrder): bool
    {
        // Only allow deletion of draft purchase orders by creator
        return $purchaseOrder->status === 'draft' && 
               $purchaseOrder->created_by === $user->id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, PurchaseOrder $purchaseOrder): bool
    {
        return false;
    }

    /**
     * Determine whether the user can approve the purchase order.
     */
    public function approve(User $user, PurchaseOrder $purchaseOrder): bool
    {
        // Allow any authenticated user to approve for now
        // In production, you'd check for specific roles/permissions
        return $purchaseOrder->status === 'pending_approval';
    }

    /**
     * Determine whether the user can send the purchase order to supplier.
     */
    public function send(User $user, PurchaseOrder $purchaseOrder): bool
    {
        // Can send if approved
        return $purchaseOrder->status === 'approved';
    }

    /**
     * Determine whether the user can receive items for the purchase order.
     */
    public function receive(User $user, PurchaseOrder $purchaseOrder): bool
    {
        // Can receive if sent to supplier
        return in_array($purchaseOrder->status, ['sent_to_supplier', 'partially_received']);
    }

    /**
     * Determine whether the user can cancel the purchase order.
     */
    public function cancel(User $user, PurchaseOrder $purchaseOrder): bool
    {
        // Can cancel if not yet fully received
        return !in_array($purchaseOrder->status, ['fully_received', 'closed', 'cancelled']);
    }
}
