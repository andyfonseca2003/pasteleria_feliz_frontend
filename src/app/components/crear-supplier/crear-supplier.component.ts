import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, Location, NgClass } from '@angular/common';
import { AdministradorService } from '../../services/administrador.service';
import { AsideComponent } from '../shared/aside/aside.component';
import Swal from 'sweetalert2';
import { SupplierService } from '../../services/supplier.service';

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
    private supplierService: SupplierService,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.supplierForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s']+$/)]],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      contactPerson: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s']+$/)]],

      taxId: [''],
      website: [''],
      notes: [''],

      hasReview: [false],
      lastOrderDate: [''],
      lastReviewRating: [0],
      lastReviewComment: [''],
      onTimeDelivery: [true],
      qualityIssues: [false],
      status: ['ACTIVO']
    });

    this.supplierForm.get('hasReview')?.valueChanges.subscribe(hasReview => {
      this.showRatingFields = hasReview;

      if (hasReview) {
        this.supplierForm.get('lastOrderDate')?.setValidators([Validators.required]);
        this.supplierForm.get('lastReviewRating')?.setValidators([Validators.required, Validators.min(0), Validators.max(5)]);
      } else {
        this.supplierForm.get('lastOrderDate')?.clearValidators();
        this.supplierForm.get('lastReviewRating')?.clearValidators();
      }

      this.supplierForm.get('lastOrderDate')?.updateValueAndValidity();
      this.supplierForm.get('lastReviewRating')?.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.supplierForm.invalid) {
      Object.keys(this.supplierForm.controls).forEach(key => {
        const control = this.supplierForm.get(key);
        control?.markAsTouched();
      });

      Swal.fire('Error', 'Por favor, complete todos los campos requeridos correctamente', 'error');
      return;
    }

    const formData = this.supplierForm.value;

    if (formData.lastOrderDate) {
      formData.lastOrderDate = `${formData.lastOrderDate}T00:00:00`;
    }

    const supplierData: any = {
      name: formData.name,
      supplierID: formData.taxId,
      address: formData.address,
      phone: formData.phone,
      email: formData.email,
      contactPerson: formData.contactPerson,
      status: "ACTIVO",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (formData.hasReview) {
      supplierData.lastOrderDate = formData.lastOrderDate !== undefined ?
        this.formatDateForBackend(formData.lastOrderDate) : null;

      supplierData.lastReviewRating = formData.lastReviewRating;
      supplierData.lastReviewComment = formData.lastReviewComment;
      supplierData.onTimeDelivery = formData.onTimeDelivery;
      supplierData.qualityIssues = formData.qualityIssues;
    }

    const currentUser = this.getUserFromStorage();
    if (currentUser && currentUser.id) {
      supplierData.userModify = currentUser.id;
    }

    this.supplierService.createSupplier(supplierData).subscribe({
      next: (response) => {
        if (response.error) {
          Swal.fire('Error', response.respuesta || 'Error al crear el proveedor', 'error');
          return;
        }

        Swal.fire('Éxito', 'Proveedor creado correctamente', 'success');
        this.router.navigate(['/listar-suppliers']);
      },
      error: (error) => {
        console.error('Error al crear proveedor:', error);
        Swal.fire('Error', error.error?.message || 'Error al crear el proveedor', 'error');
      }
    });
  }

  private getUserFromStorage(): any {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
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

  private formatDateForBackend(dateString: string | Date | null): string | null {
    if (!dateString) return null;

    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

      if (isNaN(date.getTime())) {
        console.error('Fecha inválida:', dateString);
        return null;
      }

      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');

      return `${year}-${month}-${day}T00:00:00.000Z`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return null;
    }
  }

  onKeyPress(event: KeyboardEvent, field: string) {
 const allowedPattern = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]$/;
  
  // Teclas especiales permitidas (backspace, tab, flechas, etc.)
  const allowedKeys = [
    'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 
    'Home', 'End'
  ];

  // Permitir teclas de control especiales
  if (allowedKeys.includes(event.key)) {
    return;
  }

  // Crear versión normalizada del caracter (para manejar mayúsculas/acentos)
  const inputChar = String.fromCharCode(event.charCode);

  // Validar contra el patrón permitido
  if (!allowedPattern.test(inputChar)) {
    event.preventDefault();
    
    // Opcional: Feedback visual
    const input = event.target as HTMLInputElement;
    input.classList.add('invalid-input');
    setTimeout(() => input.classList.remove('invalid-input'), 300);
  }
  }
}