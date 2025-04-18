export interface UpdateUserCommandDto {
    typeDocument: string;
    phone: string;
    position: string;
    salary: number;
    firstName: string;
    secondName: string;
    lastName: string;
    secondLastName: string;
    email: string;
    password?: string;
    status: string;
    updatedAt: string;
}
