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
  contactPerson?: string;
  hasReview?: string;
  lastOrderDate?: string;
  lastReviewRating?: number; // Calificación de 0-5
  lastReviewComment?: string; // Observaciones del último pedido
  onTimeDelivery?: boolean;   // Si cumplió con el tiempo de entrega
  qualityIssues?: boolean;
}
