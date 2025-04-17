import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { AdministradorService } from '../../services/administrador.service';
import { AsideComponent } from '../shared/aside/aside.component';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { SupplierDTO } from '../../interfaces/supplier/supplier-dto';
import { SupplierService } from '../../services/supplier.service';

@Component({
  selector: 'app-listar-suppliers',
  standalone: true,
  imports: [
    RouterLink,
    AsideComponent
  ],
  templateUrl: './listar-suppliers.component.html',
  providers: [AdministradorService],
  styleUrl: './listar-suppliers.component.css'
})
export class ListarSuppliersComponent {
  suppliers: SupplierDTO[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalItems: number = 0;

  constructor(
    private location: Location,
    private supplierService: SupplierService,
    private router: Router
  ) {
    this.loadPagedSuppliers();
  }

  public loadPagedSuppliers() {
    this.supplierService.getPagedSuppliers(this.currentPage, this.pageSize).subscribe({
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
        
        this.suppliers = data.respuesta.content;
        this.currentPage = data.respuesta.pageNumber;
        this.totalPages = data.respuesta.totalPages;
        this.totalItems = data.respuesta.totalElements;
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
        this.supplierService.deleteSupplier(id).subscribe({
          next: (data) => {
            if (data.error) {
              Swal.fire({
                title: 'Error',
                text: data.respuesta || 'Error al eliminar el proveedor',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#8b0000',
              });
              return;
            }
            
            Swal.fire({
              title: 'Eliminado',
              text: 'El proveedor ha sido eliminado',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#065f46',
            });
            this.loadPagedSuppliers();
          },
          error: (error) => {
            console.error('Error al eliminar:', error);
            Swal.fire({
              title: 'Error',
              text: error.error?.data || 'Error al eliminar el proveedor',
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
  public openEditarSupplier(id: number) {
    this.router.navigate(['/editar-supplier/' + id]);
  }

  // Método para regresar
  regresar() {
    this.location.back();
  }

  // Método para mostrar modal de reseñas
  showReviewModal(supplier: SupplierDTO) {
    // Determinar clase CSS basada en la calificación del proveedor
    let reviewClass = 'text-success';
    let reviewIcon = 'bi bi-check-circle-fill';
    let reviewBackground = 'bg-light';
    let reviewBorder = 'border-success';
    
    // Si hay una reseña negativa, cambiar estilo
    if (supplier.lastReviewRating && supplier.lastReviewRating < 3) {
      reviewClass = 'text-danger';
      reviewIcon = 'bi bi-exclamation-triangle-fill';
      reviewBackground = 'bg-light';
      reviewBorder = 'border-danger';
    }
    
    // Formatear la fecha de la última compra si existe
    const lastOrderDate = supplier.lastOrderDate ? 
      this.formatearFecha(supplier.lastOrderDate) : 'No hay registros';
    
    // Crear el HTML para el modal
    const modalHtml = `
      <div class="review-container p-4 ${reviewBackground} border ${reviewBorder}">
        <div class="d-flex align-items-center mb-3">
          <i class="${reviewIcon} fs-3 me-2 ${reviewClass}"></i>
          <h5 class="mb-0 ${reviewClass}">
            ${supplier.lastReviewRating && supplier.lastReviewRating < 3 ? 'Reseña Negativa' : 'Reseña Positiva'}
          </h5>
        </div>
        
        <div class="review-details">
          <p><strong>Último pedido:</strong> ${lastOrderDate}</p>
          <p><strong>Calificación:</strong> 
            ${this.renderStarRating(supplier.lastReviewRating || 0)}
          </p>
          
          <div class="mt-3">
            <h6>Observaciones:</h6>
            <p>${supplier.lastReviewComment || 'No hay observaciones registradas'}</p>
          </div>
          
          <div class="mt-3 d-flex flex-column">
            <div class="mb-2">
              <span class="badge ${supplier.onTimeDelivery ? 'bg-success' : 'bg-danger'} me-2">
                <i class="bi ${supplier.onTimeDelivery ? 'bi-clock' : 'bi-clock-history'}"></i>
              </span>
              <span>${supplier.onTimeDelivery ? 'Entrega a tiempo' : 'Problemas de puntualidad'}</span>
            </div>
            
            <div class="mb-2">
              <span class="badge ${supplier.qualityIssues ? 'bg-danger' : 'bg-success'} me-2">
                <i class="bi ${supplier.qualityIssues ? 'bi-emoji-frown' : 'bi-emoji-smile'}"></i>
              </span>
              <span>${supplier.qualityIssues ? 'Problemas de calidad' : 'Buena calidad de productos'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Mostrar el modal utilizando SweetAlert2
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
    
    // Estrellas vacías
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<i class="bi bi-star text-warning"></i>';
    }
    
    return starsHtml;
  }

  // Método para formatear fecha similar al componente de insumos
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
}