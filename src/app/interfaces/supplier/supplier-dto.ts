export interface SupplierDTO {
  id: number;
  name: string;
  supplierID: string;  // Cambiado de supplierDocument a supplierID
  address: string;
  phone: string;
  email: string;
  status: string; // "ACTIVO" | "INACTIVO"
  createdAt: string; // Formato: "2025-03-10T00:08:43.338034"
  updatedAt: string;
}
