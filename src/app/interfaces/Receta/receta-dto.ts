export interface RecetaDTO {
    id: number;
    name: string;
    description?: string;
    preparationTimeMinutes?: number;
    portions?: number;
    status: 'ACTIVE' | 'INACTIVE' | 'DEPRECATED'; // Usa los valores de tu enum Status
    createdById: number; // ID del usuario creador
    modifiedById?: number; // ID del usuario modificador, opcional al crear
    recipeSupplies?: string[];
}