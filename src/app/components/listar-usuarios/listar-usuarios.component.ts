import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdministradorService } from '../../services/administrador.service';
import { AsideComponent } from '../shared/aside/aside.component';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { UserService } from '../../services/user.service';
import { UserBackendResponse } from '../../interfaces/user/user-backend-response';
import { UserSimplifyResponseDto } from '../../interfaces/user/user-simplify-response-dto';

@Component({
  selector: 'app-listar-usuarios',
  standalone: true,
  imports: [
    RouterLink,
    AsideComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './listar-usuarios.component.html',
  providers: [AdministradorService],
  styleUrl: './listar-usuarios.component.css'
})
export class ListarUsuariosComponent {
  usuarios: UserBackendResponse[] = [];
  filteredUsuarios: UserBackendResponse[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalItems: number = 0;
  searchTerm: string = '';
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  isLoading: boolean = false;

  constructor(
    private location: Location,
    private userService: UserService,
    private router: Router
  ) {
    this.loadPagedUsuarios();
  }

  public loadPagedUsuarios() {
    this.isLoading = true;

    this.userService.getPagedUsers(
      this.currentPage,
      this.pageSize,
      this.sortField,
      this.sortDirection,
      this.searchTerm
    ).subscribe({
      next: (data) => {
        this.isLoading = false;
        if (data.error) {
          Swal.fire({
            title: 'Error',
            text: data.respuesta || 'No se pudieron cargar los usuarios',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#8b0000',
          });
          return;
        }

        this.usuarios = data.respuesta.content.map((user: UserBackendResponse) => {
          return {
            ...user,
            documentNumber: user.documentNumber
          } as UserBackendResponse;
        });

        this.currentPage = data.respuesta.pageNumber;
        this.totalPages = data.respuesta.totalPages;
        this.totalItems = data.respuesta.totalElements;

        // Como los datos ya vienen filtrados y ordenados del servidor,
        // simplemente los asignamos directamente
        this.filteredUsuarios = [...this.usuarios];
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al cargar usuarios:', error);
        Swal.fire({
          title: 'Error',
          text: error.error?.data || 'No se pudieron cargar los usuarios',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#8b0000',
        });
      }
    });
  }

  // Método para aplicar filtros y ordenamiento
  applyFilters() {
    // Primero aplicamos la búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsuarios = this.usuarios.filter(user =>
        user.documentNumber?.toString().includes(term) ||
        user.first_name?.toLowerCase().includes(term) ||
        user.last_name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
      );
    } else {
      this.filteredUsuarios = [...this.usuarios];
    }

    // Luego aplicamos el ordenamiento si es necesario
    if (this.sortField) {
      this.filteredUsuarios.sort((a, b) => {
        const valueA = a[this.sortField as keyof UserBackendResponse];
        const valueB = b[this.sortField as keyof UserBackendResponse];

        if (valueA === undefined || valueB === undefined) return 0;

        let comparison = 0;
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          comparison = valueA.localeCompare(valueB);
        } else {
          comparison = valueA < valueB ? -1 : (valueA > valueB ? 1 : 0);
        }

        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }
  }

  sortBy(field: string) {
    if (this.sortField === field) {
      // Si ya estamos ordenando por este campo, cambiamos la dirección
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Si es un nuevo campo, establecemos la dirección a ascendente
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    // Cargamos los datos con el nuevo orden
    this.loadPagedUsuarios();
  }

  // Método para buscar
  onSearch() {
    // Reiniciamos a la primera página al buscar
    this.currentPage = 0;
    this.loadPagedUsuarios();
  }

  // Método para limpiar la búsqueda
  clearSearch() {
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadPagedUsuarios();
  }

  goToPreviousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadPagedUsuarios();
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadPagedUsuarios();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadPagedUsuarios();
    }
  }

  getPaginationRange(): number[] {
    const range: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, this.currentPage - 2);
    let endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 1);

    // Ajustar startPage si estamos cerca del final
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }

    return range;
  }

  public eliminarUser(id: number | undefined): void {
    if (!id) {
      Swal.fire({
        title: 'Error',
        text: 'No se puede eliminar este usuario porque no tiene un ID válido',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#8b0000',
      });
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    }).then((result: SweetAlertResult<any>) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(id).subscribe({
          next: (response) => {
            Swal.fire({
              title: 'Eliminado',
              text: 'El proveedor ha sido eliminado correctamente',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#3085d6',
            });

            this.loadPagedUsuarios();
          },
          error: (error) => {
            console.error('Error al eliminar usuario:', error);
            Swal.fire({
              title: 'Error',
              text: error.error?.data || 'No se pudo eliminar el proveedor',
              icon: 'error',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#8b0000',
            });
          }
        });
      }
    });
  }

  // Método para editar un proveedor
  public openEditarUser(id: number | undefined) {
    if (id) {
      this.router.navigate(['/editar-usuarios', id]);
    } else {
      Swal.fire({
        title: 'Error',
        text: 'No se puede editar este usuario porque no tiene un ID válido',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#8b0000',
      });
    }
  }

  regresar() {
    this.location.back();
  }

  // Agrega la función para formatear el nombre del usuario si no existe
  private formatearNombreUsuario(userData: UserSimplifyResponseDto): string {
    const typeDoc = userData.typeDocument || '';
    const docNum = userData.documentNumber || '';
    const firstName = userData.first_name || '';
    const secondName = userData.second_name || '';
    const lastName = userData.last_name || '';
    const secondLastName = userData.second_last_name || '';

    const docInfo = `${typeDoc} ${docNum}`;
    const nameInfo = [firstName, secondName, lastName, secondLastName]
      .filter(part => part.trim() !== '')
      .join(' ');

    return `${docInfo} - ${nameInfo}`;
  }

  // Obtener el ícono de ordenamiento para la columna
  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return 'bi bi-arrow-down-up';
    }
    return this.sortDirection === 'asc' ? 'bi bi-sort-down-alt' : 'bi bi-sort-down';
  }

  isColumnSorted(field: string): boolean {
    return this.sortField === field;
  }
}