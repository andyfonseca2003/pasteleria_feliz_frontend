import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { AsideComponent } from '../shared/aside/aside.component';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { UserService } from '../../services/user.service';
import { TokenService } from '../../services/token.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listar-cake-orders',
  imports: [AsideComponent, CommonModule, RouterLink, FormsModule],
  templateUrl: './listar-cake-orders.component.html',
  styleUrl: './listar-cake-orders.component.css'
})
export class ListarCakeOrdersComponent {
  ordenes: any[] = [];
  filteredOrdenes: any[] = [];
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
    private pasteleriaService: OrderService,
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadPagedOrdenes();
  }

  public loadPagedOrdenes() {
    this.isLoading = true;

    this.pasteleriaService.getPagedCakeOrders(
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
            text: data.respuesta || 'No se pudieron cargar las órdenes',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#8b0000',
          });
          return;
        }

        this.ordenes = data.respuesta.content;
        this.currentPage = data.respuesta.pageNumber;
        this.totalPages = data.respuesta.totalPages;
        this.totalItems = data.respuesta.totalElements;

        this.filteredOrdenes = [...this.ordenes];
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al cargar órdenes:', error);
        Swal.fire({
          title: 'Error',
          text: error.error?.data || 'No se pudieron cargar las órdenes',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#8b0000',
        });
      }
    });
  }

  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.loadPagedOrdenes();
  }

  onSearch() {
    this.currentPage = 0;
    this.loadPagedOrdenes();
  }

  clearSearch() {
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadPagedOrdenes();
  }

  goToPreviousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadPagedOrdenes();
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadPagedOrdenes();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadPagedOrdenes();
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

  eliminarOrden(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar orden'
    }).then((result) => {
      if (result.isConfirmed) {
        this.pasteleriaService.deleteCakeOrder(id).subscribe({
          next: (data) => {
            if (data.error) {
              Swal.fire({
                title: 'Error',
                text: data.respuesta || 'Hubo un problema al cancelar la orden',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#8b0000',
              });
              return;
            }

            Swal.fire({
              title: 'Cancelada',
              text: 'La orden ha sido cancelada correctamente',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#065f46',
            });
            this.loadPagedOrdenes();
          },
          error: (error) => {
            console.error('Error al cancelar la orden:', error);
            Swal.fire({
              title: 'Error',
              text: error.error?.data || 'Hubo un problema al cancelar la orden',
              icon: 'error',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#8b0000',
            });
          }
        });
      }
    });
  }

  public openEditarOrden(id: number) {
    this.router.navigate(['/editar-orden/' + id]);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDIENTE':
        return 'bg-warning text-dark';
      case 'CONFIRMADA':
        return 'bg-primary text-white';
      case 'EN_PREPARACION':
        return 'bg-info text-dark';
      case 'LISTA':
        return 'bg-success text-white';
      case 'ENTREGADA':
        return 'bg-dark text-white';
      case 'CANCELADA':
        return 'bg-danger text-white';
      default:
        return 'bg-secondary text-white';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'CONFIRMADA':
        return 'Confirmada';
      case 'EN_PREPARACION':
        return 'En Preparación';
      case 'LISTA':
        return 'Lista';
      case 'ENTREGADA':
        return 'Entregada';
      case 'CANCELADA':
        return 'Cancelada';
      default:
        return status;
    }
  }

  canDelete(status: string): boolean {
    // Solo se pueden cancelar órdenes pendientes o confirmadas
    return ['PENDIENTE', 'CONFIRMADA'].includes(status);
  }

  showDetailModal(orden: any) {
    // Construir HTML para los detalles de la orden
    let detallesHTML = '';

    if (orden.orderDetails && orden.orderDetails.length > 0) {
      detallesHTML += '<div class="table-responsive"><table class="table table-sm table-striped">';
      detallesHTML += '<thead><tr><th>Receta</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr></thead>';
      detallesHTML += '<tbody>';

      orden.orderDetails.forEach((detalle: any) => {
        detallesHTML += `<tr>
          <td>${detalle.recipeName}</td>
          <td>${detalle.quantity}</td>
          <td>${this.formatCurrency(detalle.unitPrice)}</td>
          <td>${this.formatCurrency(detalle.subtotal)}</td>
        </tr>`;

        if (detalle.specialInstructions) {
          detallesHTML += `<tr>
            <td colspan="4"><small class="text-muted">Instrucciones: ${detalle.specialInstructions}</small></td>
          </tr>`;
        }
      });

      detallesHTML += '</tbody></table></div>';
    } else {
      detallesHTML = '<p class="text-center">No hay detalles disponibles</p>';
    }

    // Si hay alerta de inventario, mostrar esa información también
    let alertaHTML = '';
    if (orden.hasInventoryAlert) {
      alertaHTML = `
        <div class="alert alert-warning mt-3">
          <i class="bi bi-exclamation-triangle-fill"></i> Alerta de inventario:
          <p class="small mb-0">${orden.inventoryAlertDetails || 'Se ha detectado un problema con el inventario para esta orden.'}</p>
        </div>
      `;
    }

    Swal.fire({
      title: `Orden #${orden.id}`,
      html: `
        <div class="text-start">
          <p><strong>Cliente:</strong> ${orden.customerName}</p>
          <p><strong>Teléfono:</strong> ${orden.customerPhone || 'N/A'}</p>
          <p><strong>Email:</strong> ${orden.customerEmail || 'N/A'}</p>
          <p><strong>Fecha de pedido:</strong> ${this.formatDate(orden.orderDate)}</p>
          <p><strong>Fecha de entrega:</strong> ${this.formatDate(orden.deliveryDate)}</p>
          <p><strong>Estado:</strong> <span class="badge ${this.getStatusClass(orden.orderStatus)}">${this.getStatusText(orden.orderStatus)}</span></p>
          <hr>
          <h6>Detalles del pedido</h6>
          ${detallesHTML}
          ${alertaHTML}
          <div class="text-end fw-bold mt-3">
            Total: ${this.formatCurrency(orden.totalAmount)}
          </div>
        </div>
      `,
      width: 800,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#3085d6'
    });
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    });
  }

  updateStatus(orden: any) {
    // Obtener los posibles estados siguientes
    const nextStates = this.getNextPossibleStates(orden.orderStatus);

    if (nextStates.length === 0) {
      Swal.fire({
        title: 'Información',
        text: 'Esta orden ya ha alcanzado su estado final y no puede ser actualizada',
        icon: 'info',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Crear opciones para el selector
    const inputOptions: Record<string, string> = {};
    nextStates.forEach(state => {
      inputOptions[state] = this.getStatusText(state);
    });

    Swal.fire({
      title: 'Actualizar Estado',
      text: `Selecciona el nuevo estado para la Orden #${orden.id}`,
      input: 'select',
      inputOptions,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Actualizar',
      confirmButtonColor: '#3085d6',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes seleccionar un estado';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newStatus = result.value;

        // Confirmar si hay alerta de inventario y se está confirmando la orden
        if (orden.hasInventoryAlert && newStatus === 'CONFIRMADA') {
          Swal.fire({
            title: 'Advertencia',
            text: 'Esta orden tiene alertas de inventario. ¿Seguro que deseas confirmarla?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar'
          }).then((confirmResult) => {
            if (confirmResult.isConfirmed) {
              this.performStatusUpdate(orden.id, newStatus);
            }
          });
        } else {
          this.performStatusUpdate(orden.id, newStatus);
        }
      }
    });
  }

  performStatusUpdate(orderId: number, newStatus: string) {
    const updateData = {
      orderStatus: newStatus,
      updatedAt: new Date().toISOString(),
      modifiedById: this.tokenService.getIDCuenta()
    };

    this.pasteleriaService.updateCakeOrderStatus(orderId, updateData).subscribe({
      next: (response) => {
        if (response.error) {
          Swal.fire({
            title: 'Error',
            text: response.respuesta || 'No se pudo actualizar el estado',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
          return;
        }

        Swal.fire({
          title: 'Éxito',
          text: 'Estado actualizado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });

        this.loadPagedOrdenes();
      },
      error: (error) => {
        console.error('Error al actualizar estado:', error);
        Swal.fire({
          title: 'Error',
          text: error.error?.data || 'No se pudo actualizar el estado',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  getNextPossibleStates(currentStatus: string): string[] {
    switch (currentStatus) {
      case 'PENDIENTE':
        return ['CONFIRMADA', 'CANCELADA'];
      case 'CONFIRMADA':
        return ['EN_PREPARACION', 'CANCELADA'];
      case 'EN_PREPARACION':
        return ['LISTA'];
      case 'LISTA':
        return ['ENTREGADA'];
      case 'ENTREGADA':
      case 'CANCELADA':
        return []; // Estados finales, no hay transición posible
      default:
        return ['PENDIENTE', 'CONFIRMADA', 'EN_PREPARACION', 'LISTA', 'ENTREGADA', 'CANCELADA'];
    }
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return 'bi bi-arrow-down-up';
    }
    return this.sortDirection === 'asc' ? 'bi bi-sort-down-alt' : 'bi bi-sort-down';
  }
}
