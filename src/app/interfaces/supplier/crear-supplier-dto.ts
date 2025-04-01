export interface CrearSupplierDTO {
  name: string;
  supplierID: string;  // Coincide con supplierID del backend
  address: string;
  phone: string;
  email: string;
  createdAt?: string;  // Opcional en el DTO (se asigna automáticamente)
  updatedAt?: string;  // Opcional en el DTO (se asigna automáticamente)
}
