import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, Location, NgClass } from '@angular/common';
import { AdministradorService } from '../../services/administrador.service';
import { AsideComponent } from '../shared/aside/aside.component';
import Swal from 'sweetalert2';
import { SupplierDTO } from '../../interfaces/supplier/supplier-dto';

@Component({
  selector: 'app-crear-supplier',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgClass,
    AsideComponent
  ],
  providers: [AdministradorService],
  templateUrl: './crear-supplier.component.html',
  styleUrl: './crear-supplier.component.css'
})
export class CrearSupplierComponent implements OnInit {
  supplierForm!: FormGroup;
  isEditing = false;
  formTitle = 'Crear Proveedor';
  submitButtonText = 'Guardar';
  showRatingFields = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdministradorService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.supplierForm = this.fb.group({
      // Información básica del proveedor
      name: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      contactPerson: ['', Validators.required],
      
      // Campos adicionales opcionales
      taxId: [''],
      website: [''],
      notes: [''],
      
      // Campos para la reseña (inicialmente ocultos)
      hasReview: [false],
      lastOrderDate: [''],
      lastReviewRating: [0],
      lastReviewComment: [''],
      onTimeDelivery: [true],
      qualityIssues: [false]
    });

    // Escuchar cambios en el checkbox de reseña
    this.supplierForm.get('hasReview')?.valueChanges.subscribe(hasReview => {
      this.showRatingFields = hasReview;
      
      if (hasReview) {
        // Si se activa la reseña, establecer validadores para los campos de reseña
        this.supplierForm.get('lastOrderDate')?.setValidators([Validators.required]);
        this.supplierForm.get('lastReviewRating')?.setValidators([Validators.required, Validators.min(0), Validators.max(5)]);
      } else {
        // Si se desactiva, eliminar validadores
        this.supplierForm.get('lastOrderDate')?.clearValidators();
        this.supplierForm.get('lastReviewRating')?.clearValidators();
      }
      
      // Actualizar estado de validación
      this.supplierForm.get('lastOrderDate')?.updateValueAndValidity();
      this.supplierForm.get('lastReviewRating')?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.supplierForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.supplierForm.controls).forEach(key => {
        const control = this.supplierForm.get(key);
        control?.markAsTouched();
      });
      
      Swal.fire('Error', 'Por favor, complete todos los campos requeridos correctamente', 'error');
      return;
    }
    
    // Preparar datos para enviar
    const supplierData: SupplierDTO = this.supplierForm.value;
    
    // Si no hay reseña, eliminar esos campos
    if (!supplierData.hasReview) {
      delete supplierData.lastOrderDate;
      delete supplierData.lastReviewRating;
      delete supplierData.lastReviewComment;
      delete supplierData.onTimeDelivery;
      delete supplierData.qualityIssues;
    }
    
    // Eliminar campo de control que no debe ir al backend
    delete supplierData.hasReview;
    
    this.adminService.crearSupplier(supplierData).subscribe({
      next: (response) => {
        Swal.fire('Éxito', 'Proveedor creado correctamente', 'success');
        this.router.navigate(['/listar-suppliers']);
      },
      error: (error) => {
        console.error('Error al crear proveedor:', error);
        Swal.fire('Error', error.error?.message || 'Error al crear el proveedor', 'error');
      }
    });
  }

  updateRating(rating: number): void {
    this.supplierForm.patchValue({ lastReviewRating: rating });
  }

  getRatingClass(star: number): string {
    const currentRating = this.supplierForm.get('lastReviewRating')?.value || 0;
    return star <= currentRating ? 'bi-star-fill' : 'bi-star';
  }
  
  regresar(): void {
    this.location.back();
  }
}