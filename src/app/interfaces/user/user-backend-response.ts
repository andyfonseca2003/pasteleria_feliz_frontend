export interface UserBackendResponse {

    documentNumber?: number;  // Optional for creation
    typeDocument?: string; // Added from backend
    phone: string;  
    position: string;
    email: string;
    first_name: string;
    second_name: string;
    status?: string; // "ACTIVO" | "INACTIVO"
    last_name?: string;
    second_last_name?: string;
    salary?: number; 
    isAdmin?: boolean;
    createdAt?: string; 
    updatedAt?: string;
}
