import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CrearInsumoDTO } from '../../interfaces/Insumo/crear-insumo-dto';
import Swal from 'sweetalert2';
import { AsideComponent } from '../shared/aside/aside.component';
import { AdministradorService } from '../../services/administrador.service';
import { Select2Data } from 'ng-select2-component';
import { TokenService } from '../../services/token.service';
import { NgSelectModule } from '@ng-select/ng-select';

// Validador cruzado para fechas
export const fechaExpiracionMayorValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const entryDate = group.get('entryDate')?.value;
  const expirationDate = group.get('expirationDate')?.value;
  if (entryDate && expirationDate && new Date(expirationDate) <= new Date(entryDate)) {
    return { fechaInvalida: 'La fecha de expiración debe ser posterior a la fecha de entrada' };
  }
  return null;
};


@Component({
  selector: 'app-crear-insumos',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AsideComponent, NgSelectModule],
  templateUrl: './crear-insumos.component.html',
  styleUrl: './crear-insumos.component.css'
})

export class CrearInsumosComponent {

  crearInsumoForm!: FormGroup;  // Formulario reactivo
  proveedores: any[] = [];
  minDateTime;

  data: Select2Data = [];

  constructor(private formBuilder: FormBuilder,
    private location: Location,
    private adminService: AdministradorService,
    private tokenService: TokenService,
    private router: Router) {
    this.showProveedores();
    this.crearFormulario();  // Inicializa el formulario
    const now = new Date();
    now.setSeconds(0);
    this.minDateTime = now.toISOString().slice(0, 16); // Formato 'YYYY-MM-DDTHH:mm'

  }

  // Método para crear el formulario reactivo
  private crearFormulario() {
    this.crearInsumoForm = this.formBuilder.group({
      entryDate: ['', [Validators.required]],
      expirationDate: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      price: ['', [Validators.required, Validators.min(0.01)]], // mayor a 0
      quantity: ['', [Validators.required, Validators.min(1)]],  // mayor o igual a 1
      minimumStock: ['', [Validators.required, Validators.min(1)]], // mayor o igual a 1
      supplierID: ['', [Validators.required]],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userModify: null
    }, { validators: fechaExpiracionMayorValidator }); // validador cruzado
  }

  // Método para crear el insumo
  public crearInsumo() {
    // Verifica si el formulario es inválido
    if (this.crearInsumoForm.invalid) {
      const errores: string[] = [];

      const controles = this.crearInsumoForm.controls;

      if (controles['name'].errors) {
        if (controles['name'].errors['required']) errores.push('El nombre es obligatorio.');
        if (controles['name'].errors['minlength']) errores.push('El nombre es muy corto.');
        if (controles['name'].errors['maxlength']) errores.push('El nombre es demasiado largo.');
      }

      if (controles['price'].errors) {
        if (controles['price'].errors['required']) errores.push('El precio es obligatorio.');
        if (controles['price'].errors['min']) errores.push('El precio debe ser mayor a 0.');
      }

      if (controles['quantity'].errors) {
        if (controles['quantity'].errors['required']) errores.push('La cantidad es obligatoria.');
        if (controles['quantity'].errors['min']) errores.push('La cantidad debe ser al menos 1.');
      }

      if (controles['minimumStock'].errors) {
        if (controles['minimumStock'].errors['required']) errores.push('El stock mínimo es obligatorio.');
        if (controles['minimumStock'].errors['min']) errores.push('El stock mínimo debe ser al menos 1.');
      }

      if (controles['entryDate'].errors) {
        errores.push('La fecha de ingreso es obligatoria.');
      }

      if (controles['expirationDate'].errors) {
        errores.push('La fecha de expiración es obligatoria.');
      }

      if (this.crearInsumoForm.errors?.['fechaInvalida']) {
        errores.push('La fecha de expiración debe ser posterior a la fecha de entrada.');
      }

      if (controles['supplierID'].errors) {
        errores.push('Debe seleccionar un proveedor.');
      }

      Swal.fire({
        title: 'Errores en el formulario',
        html: errores.map(e => `• ${e}`).join('<br>'),
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#8b0000',
      });

      return;
    }

    // Crea el objeto DTO con los valores del formulario
    const nuevoInsumo: CrearInsumoDTO = this.crearInsumoForm.value;

    // Llama al servicio para crear el insumo
    this.adminService.crearInsumo(nuevoInsumo).subscribe({
      next: (data) => {
        if (data.error) {
          Swal.fire({
            title: 'Error',
            text: data.respuesta || 'Error al crear el insumo',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#8b0000',
          });
          return;
        }

        Swal.fire({
          title: "Éxito!",
          text: "Se ha creado un nuevo insumo.",
          icon: "success",
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#065f46',
        }).then(() => {
          this.router.navigate(["/listar-insumos"]);
        });
      },
      error: (error) => {
        console.error('Error al crear insumo:', error);
        Swal.fire({
          title: 'Error',
          text: error.error?.data || 'Error al crear el insumo',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#8b0000',
        });
      },
    });
  }

  // Método para mostrar los proveedores
  public showProveedores() {
    this.adminService.listarSuppliers().subscribe({
      next: (data) => {
        if (data.error) {
          Swal.fire({
            title: 'Error',
            text: data.respuesta || 'No se pudieron cargar los proveedores',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#8b0000',
          });
          return;
        }

        console.log('Proveedores:', data.respuesta);  // Verifica qué datos estás recibiendo
        this.proveedores = data.respuesta;

        this.data = this.proveedores.map(prov => ({
          value: prov.supplierID.toString(), // El value debe ser string
          label: prov.name // Nombre del proveedor
        }));
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
        Swal.fire({
          title: 'Error',
          text: error.error?.data || 'No se pudieron cargar los proveedores',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#8b0000',
        });
      }
    });
  }

  // Método para regresar a la página anterior
  regresar() {
    this.router.navigate(["/listar-insumos"]);
  }
}