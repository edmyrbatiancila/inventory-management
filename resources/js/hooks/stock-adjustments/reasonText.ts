export const getReasonText = (reason: string) => {
    const reasons: Record<string, string> = {
        damage: 'Damaged',
        theft: 'Theft/Loss',
        found: 'Found',
        expired: 'Expired',
        returned: 'Returns',
        transfer_in: 'Transfer In',
        transfer_out: 'Transfer Out',
        correction: 'Correction',
        recount: 'Recount',
        other: 'Other'
    };
    return reasons[reason] || reason;
};