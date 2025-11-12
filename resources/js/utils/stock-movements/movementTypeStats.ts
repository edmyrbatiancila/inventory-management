export const getMovementTypeStats = (movementTypes: Record<string, number>) => {
    const increaseTypes = ['adjustment_increase', 'transfer_in', 'purchase_receive', 'return_customer'];

    const decreaseTypes = ['adjustment_decrease', 'transfer_out', 'sale_fulfill', 'return_supplier', 'damage_write_off', 'expiry_write_off'];
        
    const increases = increaseTypes.reduce((sum, type) => sum + (movementTypes[type] || 0), 0);
    const decreases = decreaseTypes.reduce((sum, type) => sum + (movementTypes[type] || 0), 0);
        
    return { increases, decreases };
};