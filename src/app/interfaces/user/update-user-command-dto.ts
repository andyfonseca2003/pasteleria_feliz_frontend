export interface UpdateUserCommandDto {
    id: number;
    typeDocument: string;
    documentNumber: string;
    phone: string;
    position: string;
    salary: number;
    firstName: string;
    secondName: string;
    lastName: string;
    secondLastName: string;
    email: string;
    status: string;
    isAdmin: number;
    updatedAt: string;
}
