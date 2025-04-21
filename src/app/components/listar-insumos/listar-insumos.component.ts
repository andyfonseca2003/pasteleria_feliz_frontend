import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { AdministradorService } from '../../services/administrador.service';
import { AsideComponent } from '../shared/aside/aside.component';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { UserService } from '../../services/user.service';
import { UserSimplifyResponseDto } from '../../interfaces/user/user-simplify-response-dto';
import { TokenService } from '../../services/token.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listar-insumos',
  standalone: true,
  imports: [AsideComponent, CommonModule, RouterLink, FormsModule],
  providers: [AdministradorService, UserService, TokenService],
  templateUrl: './listar-insumos.component.html',
  styleUrl: './listar-insumos.component.css'
})
export class ListarInsumosComponent {
  insumos: any[] = [];
  filteredInsumos: any[] = [];
  usuarioCreador: string = 'No disponible';
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalItems: number = 0;
  searchTerm: string = '';
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  isLoading: boolean = false;
  isAdmin: boolean = false;

  constructor(
    private location: Location,
    private adminService: AdministradorService,
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.loadPagedInsumos();
    this.isAdmin = this.tokenService.getIsAdmin();
  }

  public loadPagedInsumos() {
    this.isLoading = true;
    
    this.adminService.listarInsumosPaginados(
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
            text: data.respuesta || 'No se pudieron cargar los insumos',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#8b0000',
          });
          return;
        }
        
        this.insumos = data.respuesta.content;
        this.currentPage = data.respuesta.pageNumber;
        this.totalPages = data.respuesta.totalPages;
        this.totalItems = data.respuesta.totalElements;

        this.filteredInsumos = [...this.insumos];
        
        this.cargarUsuariosModificadores();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al cargar insumos:', error);
        Swal.fire({
          title: 'Error',
          text: error.error?.data || 'No se pudieron cargar los insumos',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#8b0000',
        });
      }
    });
  }

  applyFilters() {
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      this.filteredInsumos = this.insumos.filter(insumo => 
        insumo.name?.toLowerCase().includes(term) || 
        insumo.id?.toString().includes(term) ||
        insumo.provider?.toLowerCase().includes(term)
      );
    } else {
      this.filteredInsumos = [...this.insumos];
    }

    if (this.sortField) {
      this.filteredInsumos.sort((a, b) => {
        const valueA = a[this.sortField];
        const valueB = b[this.sortField];
        
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
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    
    this.loadPagedInsumos();
  }
  
  onSearch() {
    this.currentPage = 0;
    this.loadPagedInsumos();
  }
  
  clearSearch() {
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadPagedInsumos();
  }

  goToPreviousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadPagedInsumos();
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadPagedInsumos();
    }
  }
  
  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadPagedInsumos();
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

  public eliminarInsumo(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.eliminarInsumo(id).subscribe({
          next: (data) => {
            if (data.error) {
              Swal.fire({
                title: 'Error',
                text: data.respuesta || 'Hubo un problema al eliminar el insumo',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#8b0000',
              });
              return;
            }
            
            Swal.fire({
              title: 'Eliminado',
              text: 'El insumo ha sido eliminado correctamente',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#065f46',
            });
            this.loadPagedInsumos();
          },
          error: (error) => {
            console.error('Error al eliminar el insumo:', error);
            Swal.fire({
              title: 'Error',
              text: error.error?.data || 'Hubo un problema al eliminar el insumo',
              icon: 'error',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#8b0000',
            });
          }
        });
      }
    });
  }

  public showInsumos() {
    this.adminService.listarInsumos().subscribe({
      next: (data) => {
        if (data.error) {
          Swal.fire({
            title: 'Error',
            text: data.respuesta || 'No se pudieron cargar los insumos',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#8b0000',
          });
          return;
        }
        
        console.log('Insumos:', data.respuesta);
        this.insumos = data.respuesta;
      },
      error: (error) => {
        console.error('Error al cargar insumos:', error);
        Swal.fire({
          title: 'Error',
          text: error.error?.data || 'No se pudieron cargar los insumos',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#8b0000',
        });
      }
    });
  }

  public openEditarInsumo(id: string) {
    this.router.navigate(['/editar-insumos/' + id]);
  }

  regresar() {
    this.location.back();
  }

  isDateClose(expirationDate: string): boolean {
    if (!expirationDate) return false;
    
    const expDate = new Date(expirationDate);
    const today = new Date();
    const daysDiff = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff < 7;
  }

  isDateMedium(expirationDate: string): boolean {
    if (!expirationDate) return false;
    
    const expDate = new Date(expirationDate);
    const today = new Date();
    const daysDiff = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 7 && daysDiff < 30;
  }

  isDateFar(expirationDate: string): boolean {
    if (!expirationDate) return false;
    
    const expDate = new Date(expirationDate);
    const today = new Date();
    const daysDiff = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 30;
  }

  getStockStatus(quantity: number, minStock: number): string {
    return quantity >= minStock ? 'OK' : 'Bajo Stock';
  }

  getStockStatusClass(quantity: number, minStock: number): string {
    return quantity >= minStock ? 'text-success' : 'text-danger';
  }

  showInfoModal(insumo: any) {
    // Primero definimos valores por defecto
    let usuarioModificador = 'No disponible';
    let usuarioCreador = 'No disponible';
    
    // Preparamos las fechas formateadas
    const createdAtFormatted = this.formatearFecha(insumo.createdAt);
    const updatedAtFormatted = this.formatearFecha(insumo.updatedAt);
    
    // Creamos un contador para saber cuándo se han completado todas las llamadas
    let pendingRequests = 0;
    
    // Función para mostrar el modal cuando tengamos todos los datos
    const showModal = () => {
      Swal.fire({
        title: 'Información del Insumo',
        html: `
          <p><strong>Fecha de creación:</strong> ${createdAtFormatted}</p>
          <p><strong>Fecha de actualización:</strong> ${updatedAtFormatted}</p>
          <p><strong>Usuario modificador:</strong> ${usuarioModificador}</p>
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar'
      });
    };
    
    const checkComplete = () => {
      pendingRequests--;
      if (pendingRequests === 0) {
        showModal();
      }
    };
    
    if (insumo.createdBy) {
      pendingRequests++;
      this.userService.getUserBasicInfo(insumo.createdBy).subscribe({
        next: (data) => {
          if (!data.error && data.respuesta) {
            const userData = data.respuesta as UserSimplifyResponseDto;
            usuarioCreador = this.formatearNombreUsuario(userData);
          }
          checkComplete();
        },
        error: (error) => {
          console.error('Error al obtener información del usuario creador:', error);
          checkComplete();
        }
      });
    }
    
    if (insumo.userModify) {
      pendingRequests++;
      this.userService.getUserBasicInfo(insumo.userModify).subscribe({
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
    
    if (pendingRequests === 0) {
      showModal();
    }
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

  showRotacionModal(insumo: any) {
    const minStock = insumo.minStock || 20;
    const isLowStock = insumo.quantity < minStock;
    const stockStatusClass = isLowStock ? 'text-danger' : 'text-success';
    const stockStatusText = isLowStock ? 'Bajo Stock' : 'OK';
    
    let vencimientoClass = 'bg-success';
    if (this.isDateClose(insumo.expirationDate)) {
      vencimientoClass = 'bg-danger';
    } else if (this.isDateMedium(insumo.expirationDate)) {
      vencimientoClass = 'bg-warning';
    }
    
    const tableHtml = `
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead>
            <tr>
              <th style="vertical-align: middle;">Producto</th>
              <th style="white-space: nowrap; vertical-align: middle;">Proveedor</th>
              <th>Stock Mínimo</th>
              <th>Stock Actual</th>
              <th>Fecha de Vencimiento</th>
              <th>Estado Stock</th>
              <th>¿Próximo a vencer?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${insumo.name || ''}</td>
              <td>${insumo.provider || 'No registrado'}</td>
              <td style="vertical-align: middle;">${minStock}</td>
              <td style="vertical-align: middle;">${insumo.quantity || 0}</td>
              <td style="vertical-align: middle;">${insumo.expirationDate || 'No registrado'}</td>
              <td class="${stockStatusClass}">${stockStatusText}</td>
              <td><div class="${vencimientoClass}" style="width:100%; height:45px;"></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
    
    Swal.fire({
      title: 'Información de Stock y Rotación',
      width: 900,
      html: tableHtml,
      confirmButtonText: 'Cerrar'
    });
  }

  public obtenerUsuario(id: number) {
    this.userService.getUserBasicInfo(id).subscribe({
      next: (data) => {
        console.log("respuesta");
        console.log(data.respuesta);
        if (!data.error && data.respuesta) {
          const userData = data.respuesta as UserSimplifyResponseDto;
          this.usuarioCreador = this.formatearNombreUsuario(userData);
        } else {
          this.usuarioCreador = 'No disponible';
        }
      },
      error: (error) => {
        console.error('Error al obtener información del usuario:', error);
        this.usuarioCreador = 'No disponible';
      }
    });
  }

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

  private cargarUsuariosModificadores() {
    for (const insumo of this.insumos) {
      if (insumo.userModify) {
        this.userService.getUserBasicInfo(insumo.userModify).subscribe({
          next: (data) => {
            if (!data.error && data.respuesta) {
              const userData = data.respuesta as UserSimplifyResponseDto;

              insumo.userModifyInfo = this.formatearNombreUsuario(userData);
            }
          },
          error: (error) => {
            console.error(`Error al obtener información del usuario ${insumo.userModify}:`, error);
          }
        });
      }
    }
  }

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