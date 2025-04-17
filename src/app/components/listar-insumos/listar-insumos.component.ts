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

@Component({
  selector: 'app-listar-insumos',
  standalone: true,
  imports: [AsideComponent, CommonModule, RouterLink],
  providers: [AdministradorService, UserService, TokenService],
  templateUrl: './listar-insumos.component.html',
  styleUrl: './listar-insumos.component.css'
})
export class ListarInsumosComponent {
  insumos: any[] = [];
  usuarioCreador: string = 'No disponible';

  constructor(
    private location: Location,
    private adminService: AdministradorService,
    private userService: UserService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.showInsumos();
  }

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
            this.showInsumos();
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
    if (insumo.createdBy) {
      this.obtenerUsuario(insumo.createdBy);
    } else {
      this.usuarioCreador = 'No disponible';
    }
    
    const createdAtFormatted = this.formatearFecha(insumo.createdAt);
    const updatedAtFormatted = this.formatearFecha(insumo.updatedAt);
    
    Swal.fire({
      title: 'Información del Insumo',
      html: `
        <p><strong>Fecha de creación:</strong> ${createdAtFormatted}</p>
        <p><strong>Fecha de actualización:</strong> ${updatedAtFormatted}</p>
        <p><strong>Usuario creador:</strong> ${this.usuarioCreador}</p>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
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
    
    const docInfo = `${typeDoc}: ${docNum}`;
    const nameInfo = [firstName, secondName, lastName, secondLastName]
      .filter(part => part.trim() !== '')
      .join(' ');
      
    return `${docInfo} - ${nameInfo}`;
  }
}