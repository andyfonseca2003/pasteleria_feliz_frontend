import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AsideComponent } from '../shared/aside/aside.component';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { UserService } from '../../services/user.service';
import { UserBackendResponse } from '../../interfaces/user/user-backend-response';
import { UserSimplifyResponseDto } from '../../interfaces/user/user-simplify-response-dto';
import { CreateUserCommandDto } from '../../interfaces/user/create-user-command-dto';
import { Status } from '../../interfaces/user/status.enum';
import { TypeDocument } from '../../interfaces/user/type-document.enum';

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
        user.id?.toString().includes(term) ||
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
              text: 'El usuario ha sido eliminado correctamente',
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
              text: error.error?.data || 'No se pudo eliminar el usuario',
              icon: 'error',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#8b0000',
            });
          }
        });
      }
    });
  }

  // Método para editar un usuario
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

  // Formatea el nombre del usuario
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

  showReviewModal(user: UserBackendResponse) {
    // No aplica para usuarios, mostramos información relevante
    Swal.fire({
      title: `Información de ${user.first_name} ${user.last_name}`,
      html: `
        <div class="user-info-container p-4 bg-light border">
          <div class="d-flex align-items-center mb-3">
            <i class="bi bi-person-circle fs-3 me-2 text-primary"></i>
            <h5 class="mb-0 text-primary">Detalles del Usuario</h5>
          </div>
          
          <div class="user-details">
            <p><strong>Documento:</strong> ${user.typeDocument} ${user.documentNumber}</p>
            <p><strong>Nombre completo:</strong> ${user.first_name} ${user.second_name || ''} ${user.last_name} ${user.second_last_name || ''}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Teléfono:</strong> ${user.phone}</p>
            ${user.position ? `<p><strong>Cargo:</strong> ${user.position}</p>` : ''}
            ${user.salary ? `<p><strong>Salario:</strong> $${user.salary.toLocaleString()}</p>` : ''}
            ${user.status ? `<p><strong>Estado:</strong> ${user.status}</p>` : ''}
            ${user.isAdmin !== undefined ? `<p><strong>Administrador:</strong> ${user.isAdmin ? 'Sí' : 'No'}</p>` : ''}
          </div>
        </div>
      `,
      width: 600,
      confirmButtonText: 'Cerrar',
      customClass: {
        container: 'user-info-modal'
      }
    });
  }

  // Método para mostrar información detallada
  showInfoModal(user: UserBackendResponse) {
    // Preparamos las fechas formateadas
    const createdAtFormatted = this.formatearFecha(user.createdAt || '');
    const updatedAtFormatted = this.formatearFecha(user.updatedAt || '');

    Swal.fire({
      title: 'Información Adicional',
      html: `
        <div class="user-info-container p-4 bg-light border">
          <div class="d-flex align-items-center mb-3">
            <i class="bi bi-info-circle fs-3 me-2 text-info"></i>
            <h5 class="mb-0 text-info">Metadatos</h5>
          </div>
          
          <div class="user-details">
            <p><strong>ID:</strong> ${user.id}</p>
            <p><strong>Fecha de creación:</strong> ${createdAtFormatted}</p>
            <p><strong>Fecha de actualización:</strong> ${updatedAtFormatted}</p>
            <p><strong>Estado:</strong> ${user.status || 'No disponible'}</p>
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }

  // Formateador de fechas para mostrar fecha y hora
  private formatearFecha(fechaStr: string): string {
    if (!fechaStr) return 'No disponible';

    try {
      const fecha = new Date(fechaStr);

      const opciones: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };

      return fecha.toLocaleDateString('es-ES', opciones);
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return fechaStr || 'No disponible';
    }
  }

  // Método para formatear fecha más amigable (día, mes, año)
  private obtenerSoloDia(fechaStr: string): string {
    if (!fechaStr) return 'No disponible';

    try {
      const fecha = new Date(fechaStr);

      const opciones: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };

      return fecha.toLocaleDateString('es-ES', opciones);
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return 'No disponible';
    }
  }
}