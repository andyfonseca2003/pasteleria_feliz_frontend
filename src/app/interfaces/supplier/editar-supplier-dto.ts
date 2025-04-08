/**
 * Interfaz para actualizar un proveedor existente.
 *
 * Notas:
 * - `id` es obligatorio para identificar el proveedor a editar.
 * - Los campos marcados como `@NotBlank` en el backend deben validarse en el formulario.
 * - `status` es opcional (puede usarse para activar/desactivar proveedores).
 */
export interface EditarSupplierDTO {
  id: number; // Requerido para la ruta PUT /api/suppliers/{id}

  name: string;         // @NotBlank en el backend
  supplierID: string;   // @NotBlank (antes llamado supplierDocument)
  address: string;      // @NotBlank
  phone: string;        // @NotBlank
  email: string;        // @Email + @NotBlank

  // Opcionales (dependiendo de tu lógica de negocio)
  status?: string;      // "ACTIVO" o "INACTIVO" (según el enum Status)
  updatedAt?: string;   // Fecha de actualización (puede asignarse automáticamente)
}
