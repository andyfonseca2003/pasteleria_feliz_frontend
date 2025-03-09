import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { AdministradorService } from '../../services/administrador.service';
import { AsideComponent } from '../shared/aside/aside.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-insumos',
  standalone: true,
  imports: [RouterLink, AsideComponent],
  templateUrl: './listar-insumos.component.html',
  styleUrl: './listar-insumos.component.css'
})
export class ListarInsumosComponent {
  insumos: any[] = [];
  
  
  constructor(private location: Location,
    private adminService: AdministradorService,
    private router:Router,) {
    this.showInsumos(); // Mostrar insumos cuando se carga el componente
  }

  // Método para eliminar un insumo
  public eliminarInsumo(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.eliminarInsumo(id).subscribe({
          next: (data) => {
            if (!data.error) {
              Swal.fire('Eliminado', 'El insumo ha sido eliminado correctamente', 'success');
              this.showInsumos(); // Recargar la lista de insumos después de eliminar
            } else {
              Swal.fire('Error', 'No se pudo eliminar el insumo', 'error');
            }
          },
          error: (error) => {
            console.error('Error al eliminar el insumo:', error);
            Swal.fire('Error', 'Hubo un problema al eliminar el insumo', 'error');
          }
        });
      }
    });
  }

  // Método para mostrar los insumos
  public showInsumos() {
    this.adminService.listarInsumos().subscribe({
      next: (data) => {
        console.log('Insumos:', data);  // Verifica qué datos estás recibiendo
        this.insumos = data;
      },
      error: (error) => {
        Swal.fire(error.respuesta);
        console.log(error.error);
      }
    });
  }

  public openEditarInsumo(id: string){
    this.router.navigate(['/editar-insumos/'+id])
  }
  
  // Método para regresar a la página anterior
  regresar() {
    this.location.back();
  }
}
