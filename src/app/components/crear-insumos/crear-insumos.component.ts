import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CrearInsumoDTO } from '../../interfaces/Insumo/crear-insumo-dto';
import Swal from 'sweetalert2';
import { AsideComponent } from '../shared/aside/aside.component';
import { AdministradorService } from '../../services/administrador.service';
import { Select2Data } from 'ng-select2-component';

@Component({
  selector: 'app-crear-insumos',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AsideComponent],
  templateUrl: './crear-insumos.component.html',
  styleUrl: './crear-insumos.component.css'
})
export class CrearInsumosComponent {

  crearInsumoForm!: FormGroup;  // Formulario reactivo
  proveedores: any[] = [];

  data: Select2Data = [];

  constructor(private formBuilder: FormBuilder,
    private location: Location,
    private adminService: AdministradorService,
    private router: Router) {
    this.showProveedores();
    this.crearFormulario();  // Inicializa el formulario
  }

  // Método para crear el formulario reactivo
  private crearFormulario() {
    this.crearInsumoForm = this.formBuilder.group({
      entryDate: ['', [Validators.required]],  // Nombre del insumo
      expirationDate: ['', [Validators.required]],  // Código del insumo
      name: ['', [Validators.required, Validators.min(1), Validators.max(100)]],  // Descuento (porcentaje)
      price: ['', [Validators.required]],  // Fecha de vencimiento
      quantity: ['', [Validators.required]],  // Tipo de insumo
      supplierID: ['', [Validators.required]],  // Tipo de insumo
      createdAt: new Date().toISOString(),  // Asigna la fecha actual en formato ISO
      updatedAt: new Date().toISOString(),  // También puedes hacer esto para `updatedAt`
      userModify: 1  // Tipo de insumo
    });
  }

  // Método para crear el insumo
  public crearInsumo() {
    // Verifica si el formulario es inválido
    if (this.crearInsumoForm.invalid) {
      Swal.fire({
        title: 'Formulario incompleto', 
        text: 'Por favor, rellene todos los campos correctamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#8b0000',
      });
      return;  // Si el formulario es inválido, no hace nada
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