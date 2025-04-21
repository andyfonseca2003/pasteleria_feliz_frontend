import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location, NgClass } from '@angular/common';
import { AdministradorService } from '../../services/administrador.service';
import { AsideComponent } from '../shared/aside/aside.component';
import Swal from 'sweetalert2';
import { SupplierService } from '../../services/supplier.service';
import { SupplierFormData } from '../../interfaces/supplier/supplier-form-data';

@Component({
  selector: 'app-editar-supplier',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgClass,
    AsideComponent
  ],
  providers: [AdministradorService],
  templateUrl: './editar-supplier.component.html',
  styleUrl: './editar-supplier.component.css'
})
export class EditarSupplierComponent implements OnInit {
  supplierForm!: FormGroup;
  isEditing = true;
  formTitle = 'Editar proveedor';
  submitButtonText = 'Actualizar';
  showRatingFields = false;
  supplierId: number = 0;
  loading: boolean = true;

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.supplierId = parseInt(id);
        this.loadSupplierData(this.supplierId);
      } else {
        Swal.fire({
          title: 'Error',
          text: 'No se encontró el ID del proveedor',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#8b0000',
        });
        this.router.navigate(['/listar-suppliers']);
      }
    });
  }

  private initForm(): void {
    this.supplierForm = this.fb.group({

      name: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      contactPerson: ['', Validators.required],

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

  loadSupplierData(id: number): void {
    this.loading = true;

    this.supplierService.getSupplier(id).subscribe({
      next: (data) => {
        if (data.error) {
          Swal.fire({
            title: 'Error',
            text: data.respuesta || 'No se pudo cargar la información del proveedor',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#8b0000',
          });
          this.router.navigate(['/listar-suppliers']);
          return;
        }

        const supplier = data.respuesta;
        console.log('Datos del proveedor recibidos:', supplier);

        const hasReview = !!(supplier.lastOrderDate ||
          supplier.lastReviewRating ||
          supplier.lastReviewComment ||
          supplier.onTimeDelivery !== undefined ||
          supplier.qualityIssues !== undefined);

        const formData: SupplierFormData = {
          name: supplier.name || '',
          taxId: supplier.supplierID || '',
          address: supplier.address || '',
          phone: supplier.phone || '',
          email: supplier.email || '',
          contactPerson: supplier.contactPerson || '',
          website: supplier.website || '',
          notes: supplier.notes || '',
          status: supplier.status || 'ACTIVO',
          // Inicializar campos de reseña con valores por defecto
          hasReview: hasReview,
          lastOrderDate: '',
          lastReviewRating: 0,
          lastReviewComment: '',
          onTimeDelivery: true,
          qualityIssues: false
        };

        // Si tiene reseña, asignar los valores específicos de la reseña
        if (hasReview) {
          console.log('Proveedor tiene reseña, configurando campos...'); // Para depuración

          // Formatear la fecha para el input type="date" si existe
          if (supplier.lastOrderDate) {
            // Formatear como YYYY-MM-DD para que funcione con el input type="date"
            try {
              const date = new Date(supplier.lastOrderDate);
              if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                formData.lastOrderDate = `${year}-${month}-${day}`;
              } else {
                formData.lastOrderDate = supplier.lastOrderDate;
              }
            } catch (e) {
              console.error('Error al formatear fecha de reseña:', e);
              formData.lastOrderDate = supplier.lastOrderDate;
            }
          }

          formData.lastReviewRating = supplier.lastReviewRating !== undefined ? supplier.lastReviewRating : 0;
          formData.lastReviewComment = supplier.lastReviewComment || '';
          formData.onTimeDelivery = supplier.onTimeDelivery !== undefined ? supplier.onTimeDelivery : true;
          formData.qualityIssues = supplier.qualityIssues !== undefined ? supplier.qualityIssues : false;
        }

        this.supplierForm.patchValue(formData);
        this.showRatingFields = hasReview;

        setTimeout(() => {
          if (hasReview) {
            this.supplierForm.get('hasReview')?.setValue(true);
            this.showRatingFields = true;
          }
        }, 0);

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos del proveedor:', error);
        Swal.fire({
          title: 'Error',
          text: error.error?.data || 'No se pudo cargar la información del proveedor',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#8b0000',
        });
        this.loading = false;
        this.router.navigate(['/listar-suppliers']);
      }
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

    const formData: SupplierFormData = this.supplierForm.value;

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

    this.supplierService.updateSupplier(this.supplierId, supplierData).subscribe({
      next: (data) => {
        if (data.error) {
          Swal.fire({
            title: 'Error',
            text: data.respuesta || 'Error al actualizar el proveedor',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#8b0000',
          });
          return;
        }

        Swal.fire({
          title: 'Éxito',
          text: 'Proveedor actualizado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#065f46',
        });
        this.router.navigate(['/listar-suppliers']);
      },
      error: (error) => {
        console.error('Error al actualizar proveedor:', error);

        if (error.error && error.error.message && error.error.message.includes('LocalDateTime')) {
          Swal.fire({
            title: 'Error de formato de fecha',
            text: 'Hay un problema con el formato de la fecha. Se intentará corregir automáticamente.',
            icon: 'warning',
            confirmButtonText: 'Reintentar',
            confirmButtonColor: '#8b0000',
          }).then(() => {
            if (formData.lastOrderDate) {
              const dateOnly = formData.lastOrderDate.split('T')[0];
              supplierData.lastOrderDate = `${dateOnly}T00:00:00.000Z`;

              this.supplierService.updateSupplier(this.supplierId, supplierData).subscribe({
                next: (retryData) => {
                  Swal.fire({
                    title: 'Éxito',
                    text: 'Proveedor actualizado correctamente',
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#065f46',
                  });
                  this.router.navigate(['/listar-suppliers']);
                },
                error: (retryError) => {
                  Swal.fire({
                    title: 'Error',
                    text: 'No se pudo actualizar el proveedor después de corregir el formato de fecha',
                    icon: 'error',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#8b0000',
                  });
                }
              });
            } else {
              Swal.fire({
                title: 'Error',
                text: 'No hay fecha disponible para corregir',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#8b0000',
              });
            }
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: error.error?.data || 'Error al actualizar el proveedor',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#8b0000',
          });
        }
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

  private formatDateForBackend(dateString: string | Date | null | undefined): string | null {
    if (!dateString) return null;

    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

      if (!(date instanceof Date) || isNaN(date.getTime())) {
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
}