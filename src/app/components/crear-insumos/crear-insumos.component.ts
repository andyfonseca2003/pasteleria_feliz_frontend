import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { CrearInsumoDTO } from '../../interfaces/Insumo/crear-insumo-dto'; 
import Swal from 'sweetalert2';
import { AsideComponent } from '../shared/aside/aside.component';
import { AdministradorService } from '../../services/administrador.service';

@Component({
  selector: 'app-crear-insumos',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AsideComponent],
  templateUrl: './crear-insumos.component.html',
  styleUrl: './crear-insumos.component.css'
})
export class CrearInsumosComponent {

  crearInsumoForm!: FormGroup;  // Formulario reactivo

  constructor(private formBuilder: FormBuilder, 
              private location: Location,
              private adminService: AdministradorService,
              private router: Router) {
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
      createdAt: "2023-09-17T09:00:00",
      updatedAt: "2023-09-17T09:05:00",
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
        this.location.back(); // Regresar a la página anterior después de aceptar
      });
    },
    error: (error) => {
      Swal.fire(error.respuesta)
      console.log(error);
    },
  });
}

  // Método para regresar a la página anterior
  regresar() {
    this.router.navigate(["/listar-insumos"]);

  }
}
