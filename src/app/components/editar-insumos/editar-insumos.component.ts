import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AdministradorService } from '../../services/administrador.service';
import Swal from 'sweetalert2';
import { EditarInsumoDTO } from '../../interfaces/Insumo/editar-insumo-dto';
import { AsideComponent } from '../shared/aside/aside.component';

@Component({
  selector: 'app-editar-insumos',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, AsideComponent],
  templateUrl: './editar-insumos.component.html',
  styleUrl: './editar-insumos.component.css'
})
export class EditarInsumosComponent {
  editarInsumoForm!: FormGroup;
  tiposDeInsumo: any[] = [];    // Lista de tipos de insumos
  insumo: any = {}; // Para almacenar el insumo a editar

  constructor(private formBuilder: FormBuilder, private location: Location,
    private activatedRoute: ActivatedRoute,
    private adminService: AdministradorService,
    private router: Router
  ) {
    this.crearFormulario();

    const id = this.activatedRoute.snapshot.paramMap.get('id'); // Obtener el id de la URL
    if (id) {
      this.obtenerInsumo(id); // Llamar al método con el id
    }
  }

  obtenerInsumo(id: string): void {
    this.adminService.obtenerInsumo(id).subscribe({
      next: (data) => {
        console.log(data);
        this.insumo = data.respuesta;

        // Utilizamos patchValue para actualizar los valores del formulario
        this.editarInsumoForm.patchValue({
          id: this.insumo.id,
          name: this.insumo.name,
          price: this.insumo.price,
          entryDate: this.insumo.entryDate,
          expirationDate: this.insumo.expirationDate,
          quantity: this.insumo.quantity,
          minimumStock: this.insumo.minimumStock,
          updatedAt: this.insumo.updatedAt
        });
      },
      error: (error) => {
        Swal.fire('Error', 'No se pudo obtener el insumo', 'error');
        console.error('Error al obtener el insumo:', error);
      }
    });
  }


  guardarCambios(): void {
    // Marcar todos los controles como tocados y actualizar su validez
    Object.values(this.editarInsumoForm.controls).forEach(control => {
      control.markAsTouched();
      control.updateValueAndValidity();
    });

    // Obtener los valores del formulario y crear el objeto EditarInsumoDTO
    const editarInsumoDTO = this.editarInsumoForm.value as EditarInsumoDTO;
    console.log('Datos a enviar:', editarInsumoDTO); // Verificar los valores

    // Llamar al servicio para actualizar el insumo
    this.adminService.actualizarInsumo(editarInsumoDTO).subscribe({
      next: (data) => {
        Swal.fire('Éxito', 'Insumo actualizado correctamente', 'success').then(() => {
          this.router.navigate(["/listar-insumos"]);
        });
      },
      error: (error) => {
        Swal.fire('Error', 'Hubo un problema al actualizar el insumo', 'error');
        console.error('Error al actualizar el insumo:', error);
      }
    });
  }

  private crearFormulario(idInsumo: string = '') {
    this.editarInsumoForm = this.formBuilder.group({
      id: [idInsumo, [Validators.required]], // Carga el ID del insumo
      name: ['', [Validators.required]],
      expirationDate: ['', [Validators.required]],
      entryDate: ['', [Validators.required]],
      price: ['', [Validators.required]],
      quantity: ['', [Validators.required]],
      minimumStock: ['', [Validators.required]],
      updatedAt: ['', [Validators.required]]
    });
  }

  public editarInsumo() {
    console.log(this.editarInsumoForm.value);
  }
  // Método para regresar a la página anterior
  regresar() {
    this.location.back();
  }
}
