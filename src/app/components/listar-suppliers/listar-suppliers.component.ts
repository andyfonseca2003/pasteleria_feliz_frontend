import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdministradorService } from '../../services/administrador.service';
import { AsideComponent } from '../shared/aside/aside.component';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { SupplierDTO } from '../../interfaces/supplier/supplier-dto';
import { SupplierService } from '../../services/supplier.service';
import { SupplierBackendResponse } from '../../interfaces/supplier/supplier-backend-response';
import { UserSimplifyResponseDto } from '../../interfaces/user/user-simplify-response-dto';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-listar-suppliers',
  standalone: true,
  imports: [
    RouterLink,
    AsideComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './listar-suppliers.component.html',
  providers: [AdministradorService],
  styleUrl: './listar-suppliers.component.css'
})
export class ListarSuppliersComponent {
  suppliers: SupplierDTO[] = [];
  filteredSuppliers: SupplierDTO[] = [];
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
    private supplierService: SupplierService,
    private userService: UserService,
    private router: Router
  ) {
    this.loadPagedSuppliers();
  }

  public loadPagedSuppliers() {
    this.isLoading = true;
    
    this.supplierService.getPagedSuppliers(
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
            text: data.respuesta || 'No se pudieron cargar los proveedores',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#8b0000',
          });
          return;
        }
        
        this.suppliers = data.respuesta.content.map((supplier: SupplierBackendResponse) => {
          return {
            ...supplier,
            taxId: supplier.supplierID
          } as SupplierDTO;
        });
        
        this.currentPage = data.respuesta.pageNumber;
        this.totalPages = data.respuesta.totalPages;
        this.totalItems = data.respuesta.totalElements;
        
        // Como los datos ya vienen filtrados y ordenados del servidor,
        // simplemente los asignamos directamente
        this.filteredSuppliers = [...this.suppliers];
      },
      error: (error) => {
        this.isLoading = false;
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
  
  // Método para aplicar filtros y ordenamiento
  applyFilters() {
    // Primero aplicamos la búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      this.filteredSuppliers = this.suppliers.filter(supplier => 
        supplier.name?.toLowerCase().includes(term) || 
        supplier.id?.toString().includes(term) ||
        supplier.email?.toLowerCase().includes(term) ||
        supplier.contactPerson?.toLowerCase().includes(term)
      );
    } else {
      this.filteredSuppliers = [...this.suppliers];
    }

    // Luego aplicamos el ordenamiento si es necesario
    if (this.sortField) {
      this.filteredSuppliers.sort((a, b) => {
        const valueA = a[this.sortField as keyof SupplierDTO];
        const valueB = b[this.sortField as keyof SupplierDTO];
        
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
    this.loadPagedSuppliers();
  }
  
  // Método para buscar
  onSearch() {
    // Reiniciamos a la primera página al buscar
    this.currentPage = 0;
    this.loadPagedSuppliers();
  }
  
  // Método para limpiar la búsqueda
  clearSearch() {
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadPagedSuppliers();
  }
  
  goToPreviousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadPagedSuppliers();
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadPagedSuppliers();
    }
  }
  
  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadPagedSuppliers();
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

  public eliminarSupplier(id: number | undefined): void {
    if (!id) {
      Swal.fire({
        title: 'Error',
        text: 'No se puede eliminar este proveedor porque no tiene un ID válido',
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
        this.supplierService.deleteSupplier(id).subscribe({
          next: (response) => {
            Swal.fire({
              title: 'Eliminado',
              text: 'El proveedor ha sido eliminado correctamente',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#3085d6',
            });

            this.loadPagedSuppliers();
          },
          error: (error) => {
            console.error('Error al eliminar proveedor:', error);
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

  public showSuppliers() {
    this.supplierService.getAllSuppliers().subscribe({
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
        
        this.suppliers = data.respuesta;
        this.applyFilters();
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

  // Método para editar un proveedor
  public openEditarSupplier(id: number | undefined) {
    if (id) {
      this.router.navigate(['/editar-suppliers', id]);
    } else {
      Swal.fire({
        title: 'Error',
        text: 'No se puede editar este proveedor porque no tiene un ID válido',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#8b0000',
      });
    }
  }

  regresar() {
    this.location.back();
  }

  showReviewModal(supplier: SupplierDTO) {
    // Comprobar si hay alguna reseña registrada
    const hasReview = supplier.lastOrderDate || supplier.lastReviewRating || supplier.lastReviewComment;
    
    let modalHtml = '';
    
    if (!hasReview) {
      // Si no hay reseña, mostrar un mensaje indicando que no hay reseñas aún
      modalHtml = `
        <div class="review-container p-4 bg-light border">
          <div class="d-flex align-items-center mb-3">
            <i class="bi bi-info-circle fs-3 me-2 text-info"></i>
            <h5 class="mb-0 text-info">Sin Reseñas</h5>
          </div>
          
          <div class="review-details text-center py-4">
            <p>Este proveedor no tiene reseñas registradas aún.</p>
          </div>
        </div>
      `;
    } else {
      // Si hay reseña, procesar normalmente
      // Determinar si es una reseña negativa: si tiene problemas de calidad O problemas de puntualidad
      // O si la calificación es menor a 3
      const isNegativeReview = supplier.qualityIssues || !supplier.onTimeDelivery || 
        (supplier.lastReviewRating && supplier.lastReviewRating < 3);
      
      let reviewClass = isNegativeReview ? 'text-danger' : 'text-success';
      let reviewIcon = isNegativeReview ? 'bi bi-exclamation-triangle-fill' : 'bi bi-check-circle-fill';
      let reviewBackground = 'bg-light';
      let reviewBorder = isNegativeReview ? 'border-danger' : 'border-success';
      
      // Obtener la fecha formateada de la última reseña
      const lastReviewDay = supplier.lastOrderDate ? 
        this.obtenerSoloDia(supplier.lastOrderDate) : 'No hay registros';
      
      modalHtml = `
        <div class="review-container p-4 ${reviewBackground} border ${reviewBorder}">
          <div class="d-flex align-items-center mb-3">
            <i class="${reviewIcon} fs-3 me-2 ${reviewClass}"></i>
            <h5 class="mb-0 ${reviewClass}">
              ${isNegativeReview ? 'Reseña Negativa' : 'Reseña Positiva'}
            </h5>
          </div>
          
          <div class="review-details">
            <p><strong>Última reseña:</strong> ${lastReviewDay}</p>
            <p><strong>Calificación:</strong> 
              ${this.renderStarRating(supplier.lastReviewRating || 0)}
            </p>
            
            <div class="mt-3">
              <h6>Observaciones:</h6>
              <p>${supplier.lastReviewComment || 'No hay observaciones registradas'}</p>
            </div>
            
            <div class="mt-3 d-flex flex-column">
              ${supplier.onTimeDelivery !== undefined ? `
                <div class="mb-2">
                  <span class="badge ${supplier.onTimeDelivery ? 'bg-success' : 'bg-danger'} me-2">
                    <i class="bi ${supplier.onTimeDelivery ? 'bi-clock' : 'bi-clock-history'}"></i>
                  </span>
                  <span>${supplier.onTimeDelivery ? 'Entrega a tiempo' : 'Problemas de puntualidad'}</span>
                </div>
              ` : ''}
              
              ${supplier.qualityIssues !== undefined ? `
                <div class="mb-2">
                  <span class="badge ${supplier.qualityIssues ? 'bg-danger' : 'bg-success'} me-2">
                    <i class="bi ${supplier.qualityIssues ? 'bi-emoji-frown' : 'bi-emoji-smile'}"></i>
                  </span>
                  <span>${supplier.qualityIssues ? 'Problemas de calidad' : 'Buena calidad de productos'}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }
    
    Swal.fire({
      title: `Reseña de ${supplier.name}`,
      html: modalHtml,
      width: 600,
      confirmButtonText: 'Cerrar',
      customClass: {
        container: 'supplier-review-modal'
      }
    });
  }

  // Método para generar estrellas de calificación
  private renderStarRating(rating: number): string {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHtml = '';
    
    // Estrellas completas
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<i class="bi bi-star-fill text-warning"></i>';
    }
    
    // Media estrella si aplica
    if (halfStar) {
      starsHtml += '<i class="bi bi-star-half text-warning"></i>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<i class="bi bi-star text-warning"></i>';
    }
    
    return starsHtml;
  }

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

  showInfoModal(supplier: SupplierDTO) {
    // Valores por defecto
    let usuarioModificador = 'No disponible';
    
    // Preparamos las fechas formateadas
    const createdAtFormatted = this.formatearFecha(supplier.createdAt || '');
    const updatedAtFormatted = this.formatearFecha(supplier.updatedAt || '');
    
    // Contador para peticiones pendientes
    let pendingRequests = 0;
    
    // Función para mostrar el modal
    const showModal = () => {
      Swal.fire({
        title: 'Información del Proveedor',
        html: `
          <p><strong>Fecha de creación:</strong> ${createdAtFormatted}</p>
          <p><strong>Fecha de actualización:</strong> ${updatedAtFormatted}</p>
          <p><strong>Usuario modificador:</strong> ${usuarioModificador}</p>
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar'
      });
    };
    
    // Función para verificar completitud
    const checkComplete = () => {
      pendingRequests--;
      if (pendingRequests === 0) {
        showModal();
      }
    };
    
    // Si hay usuario modificador, lo obtenemos
    if (supplier.userModify) {
      pendingRequests++;
      this.userService.getUserBasicInfo(supplier.userModify).subscribe({
        next: (data) => {
          if (!data.error && data.respuesta) {
            const userData = data.respuesta as UserSimplifyResponseDto;
            usuarioModificador = this.formatearNombreUsuario(userData);
          }
          checkComplete();
        },
        error: (error) => {
          console.error('Error al obtener información del usuario modificador:', error);
          checkComplete();
        }
      });
    }
    
    // Si no hay peticiones pendientes, mostramos el modal de inmediato
    if (pendingRequests === 0) {
      showModal();
    }
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