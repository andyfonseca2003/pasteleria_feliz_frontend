import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CrearSupplierDTO } from '../../interfaces/supplier/crear-supplier-dto';
import Swal from 'sweetalert2';
import { AsideComponent } from '../shared/aside/aside.component';
import { AdministradorService } from '../../services/administrador.service';

@Component({
  selector: 'app-crear-supplier',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AsideComponent],
  templateUrl: './crear-supplier.component.html',
  styleUrl: './crear-supplier.component.css'
})
export class CrearSupplierComponent {
  // Formulario reactivo para crear proveedor
  crearSupplierForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private location: Location,
    private adminService: AdministradorService,
    private router: Router
  ) {
    this.crearFormulario(); // Inicializa el formulario al crear el componente
  }

  /**
   * Inicializa el formulario reactivo con validaciones
   */
  private crearFormulario() {
    this.crearSupplierForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      supplierID: ['', [Validators.required, Validators.minLength(5)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      phone: ['', [Validators.required, Validators.pattern(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/)]],
      email: ['', [Validators.required, Validators.email]],
      // Campos automáticos (no visibles en el formulario)
      status: ['ACTIVO'], // Valor por defecto
      createdAt: [new Date().toISOString()], // Fecha actual
      updatedAt: [new Date().toISOString()], // Fecha actual
      userModify: [1] // ID de usuario (ajustar según autenticación)
    });
  }

  /**
   * Método para crear un nuevo proveedor
   */
  public crearSupplier() {
    // Verifica si el formulario es válido
    if (this.crearSupplierForm.invalid) {
      Swal.fire('Formulario incompleto', 'Por favor complete todos los campos requeridos correctamente.', 'error');
      return;
    }

    // Crea el DTO con los valores del formulario
    const nuevoSupplier: CrearSupplierDTO = this.crearSupplierForm.value;

    // Llama al servicio para crear el proveedor
    this.adminService.crearSupplier(nuevoSupplier).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Proveedor creado correctamente', 'success')
          .then(() => {
            this.router.navigate(['/listar-suppliers']); // Redirige al listado
          });
      },
      error: (error) => {
        console.error('Error al crear proveedor:', error);
        const mensaje = error.error?.message || 'Error desconocido al crear el proveedor';
        Swal.fire('Error', mensaje, 'error');
      }
    });
  }

  /**
   * Método para regresar a la página anterior
   */
  regresar() {
    this.location.back();
  }
}
