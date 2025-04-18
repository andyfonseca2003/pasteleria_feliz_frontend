export interface SupplierBackendResponse {

    id?: number;  // Optional for creation
    name: string;
    typeDocument?: string; // Added from backend
    supplierID: string;  
    address: string;
    phone: string;
    email: string;
    contactPerson: string;
    status?: string; // "ACTIVO" | "INACTIVO"
    createdAt?: string; 
    updatedAt?: string;
    // Review fields
    lastOrderDate?: string;
    lastReviewRating?: number;
    lastReviewComment?: string;
    onTimeDelivery?: boolean;
    qualityIssues?: boolean;
    userModify?: number;
}
