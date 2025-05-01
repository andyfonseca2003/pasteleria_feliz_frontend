export interface CreateUserCommandDto {
    id: number,
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
    password: string;
    status: string;
    isAdmin: boolean;
    createdAt: string;
    updatedAt: string;
}
