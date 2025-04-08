import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CrearInsumoDTO } from '../../interfaces/Insumo/crear-insumo-dto';
import Swal from 'sweetalert2';
import { AsideComponent } from '../shared/aside/aside.component';
import { AdministradorService } from '../../services/administrador.service';
import { Select2, Select2Data, Select2Hint, Select2Label } from 'ng-select2-component';

@Component({
  selector: 'app-crear-insumos',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AsideComponent, Select2, Select2Hint, Select2Label],
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
      Swal.fire('Formulario incompleto', 'Por favor, rellene todos los campos correctamente.', 'error');
      return;  // Si el formulario es inválido, no hace nada
    }

    // Crea el objeto DTO con los valores del formulario
    const nuevoInsumo: CrearInsumoDTO = this.crearInsumoForm.value;

    // Llama al servicio para crear el insumo
    this.adminService.crearInsumo(nuevoInsumo).subscribe({
      next: () => {
        Swal.fire("Éxito!", "Se ha creado un nuevo insumo.", "success").then(() => {
          this.router.navigate(["/listar-insumos"]);
        });
      },
      error: (error) => {
        Swal.fire(error.respuesta)
        console.log(error);
      },
    });
  }

  // Método para mostrar los insumos
  public showProveedores() {
    this.adminService.listarSuppliers().subscribe({
      next: (data) => {
        console.log('Proveedores:', data);  // Verifica qué datos estás recibiendo
        this.proveedores = data;
        this.data = this.proveedores.map(prov => ({
          value: prov.supplierID.toString(), // El value debe ser string
          label: prov.name // Nombre del proveedor
        }));
      },
      error: (error) => {
        Swal.fire(error.respuesta);
        console.log(error.error);
      }
    });
  }

  // Método para regresar a la página anterior
  regresar() {
    this.router.navigate(["/listar-insumos"]);

  }
}
