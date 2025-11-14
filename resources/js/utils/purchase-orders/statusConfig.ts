import { CheckCircle, Clock, FileText, PackagePlus, Send, X } from "lucide-react";

export const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
    pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    sent_to_supplier: { label: 'Sent to Supplier', color: 'bg-blue-100 text-blue-800', icon: Send },
    partially_received: { label: 'Partially Received', color: 'bg-orange-100 text-orange-800', icon: PackagePlus },
    fully_received: { label: 'Fully Received', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: X },
    closed: { label: 'Closed', color: 'bg-slate-100 text-slate-800', icon: CheckCircle },
};

export const priorityConfig = {
    low: { label: 'Low', color: 'bg-green-100 text-green-700' },
    normal: { label: 'Normal', color: 'bg-gray-100 text-gray-700' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' },
};