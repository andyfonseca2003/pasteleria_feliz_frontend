export interface SupplierFormData {
    name: string;
    taxId: string;
    address: string;
    phone: string;
    email: string;
    contactPerson: string;
    hasReview: boolean;
    lastOrderDate?: string;
    lastReviewRating?: number;
    lastReviewComment?: string;
    onTimeDelivery?: boolean;
    qualityIssues?: boolean;
    status: string;
    website?: string;
    notes?: string;
}
