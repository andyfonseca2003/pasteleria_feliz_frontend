export interface UserUpdateResponse {
    id?: number;  // Optional for creation
    documentNumber?: number;  // Optional for creation
    typeDocument?: string; // Added from backend
    phone: string;  
    position: string;
    email: string;
    firstName: string;
    secondName: string;
    status?: string; // "ACTIVO" | "INACTIVO"
    lastName?: string;
    secondLastName?: string;
    salary?: number; 
    isAdmin?: boolean;
    createdAt?: string; 
    updatedAt?: string;
}
