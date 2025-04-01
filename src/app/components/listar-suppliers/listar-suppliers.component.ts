import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {DatePipe, Location, NgClass} from '@angular/common';
import { AdministradorService } from '../../services/administrador.service';
import { AsideComponent } from '../shared/aside/aside.component';
import Swal, {SweetAlertResult} from 'sweetalert2';
import { SupplierDTO } from '../../interfaces/supplier/supplier-dto';

@Component({
  selector: 'app-listar-suppliers',
  standalone: true,

  templateUrl: './listar-suppliers.component.html',
  imports: [
    DatePipe,
    NgClass,
    AsideComponent
  ],
  styleUrl: './listar-suppliers.component.css'
})
export class ListarSuppliersComponent {
  suppliers: SupplierDTO[] = []; // Usando la interfaz SupplierDTO

  constructor(
    private location: Location,
    private adminService: AdministradorService,
    private router: Router
  ) {
    this.showSuppliers(); // Cargar proveedores al iniciar
  }

  // Método para eliminar un proveedor
  public eliminarSupplier(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    }).then((result: SweetAlertResult<any>) => {
      if (result.isConfirmed) {
        this.adminService.eliminarSupplier(id.toString()).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El proveedor ha sido eliminado', 'success');
            this.showSuppliers();
          },
          error: (error: { error?: { message?: string } }) => {
            console.error('Error al eliminar:', error);
            const errorMessage = error.error?.message || 'Error al eliminar';
            Swal.fire('Error', errorMessage, 'error');
          }
        });
      }
    });
  }

  // Método para cargar los proveedores
  public showSuppliers() {
    this.adminService.listarSuppliers().subscribe({
      next: (data: SupplierDTO[]) => {
        this.suppliers = data;
      },
      error: (error) => {
        Swal.fire('Error', 'No se pudieron cargar los proveedores', 'error');
        console.error(error);
      }
    });
  }

  // Método para editar un proveedor
  public openEditarSupplier(id: number) {
    this.router.navigate(['/editar-supplier/' + id]);
  }

  // Método para regresar
  regresar() {
    this.location.back();
  }
}
