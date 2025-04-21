import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AsideComponent } from '../shared/aside/aside.component';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { RecetaService } from '../../services/receta.service';
import { RecetaDTO } from '../../interfaces/Receta/receta-dto';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-listar-recetas',
  standalone: true,
  imports: [
    RouterLink,
    AsideComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './listar-recetas.component.html',
  providers: [RecetaService],
  styleUrl: './listar-recetas.component.css'
})
export class ListarRecetasComponent {
  recetas: RecetaDTO[] = [];
  filteredRecetas: RecetaDTO[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalItems: number = 0;
  searchTerm: string = '';
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  isAdmin: boolean = false;
  isLoading: boolean = false;

  constructor(
    private location: Location,
    private recetaService: RecetaService,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.loadPagedRecetas();
    this.isAdmin = this.tokenService.getIsAdmin();
  }

  public loadPagedRecetas() {
    this.isLoading = true;

    this.recetaService.getPagedRecetas(
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
            text: data.respuesta || 'No se pudieron cargar las recetas',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#8b0000',
          });
          return;
        }

        this.recetas = data.respuesta.content;
        this.currentPage = data.respuesta.pageNumber;
        this.totalPages = data.respuesta.totalPages;
        this.totalItems = data.respuesta.totalElements;

        this.filteredRecetas = [...this.recetas];
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al cargar recetas:', error);
        Swal.fire({
          title: 'Error',
          text: error.error?.data || 'No se pudieron cargar las recetas',
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
      this.filteredRecetas = this.recetas.filter(receta =>
        receta.id?.toString().includes(term)
        // receta.nombre?.toLowerCase().includes(term) ||
        // receta.descripcion?.toLowerCase().includes(term)
      );
    } else {
      this.filteredRecetas = [...this.recetas];
    }

    if (this.sortField) {
      this.filteredRecetas.sort((a, b) => {
        const valueA = a[this.sortField as keyof RecetaDTO];
        const valueB = b[this.sortField as keyof RecetaDTO];

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

    this.loadPagedRecetas();
  }

  onSearch() {
    this.currentPage = 0;
    this.loadPagedRecetas();
  }

  clearSearch() {
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadPagedRecetas();
  }

  goToPreviousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadPagedRecetas();
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadPagedRecetas();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadPagedRecetas();
    }
  }

  getPaginationRange(): number[] {
    const range: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, this.currentPage - 2);
    let endPage = Math.min(this.totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }

    return range;
  }

  public eliminarReceta(id: number | undefined): void {
    if (!id) {
      Swal.fire({
        title: 'Error',
        text: 'No se puede eliminar esta receta porque no tiene un ID válido',
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
        this.recetaService.deleteReceta(id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Eliminado',
              text: 'La receta ha sido eliminada correctamente',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#3085d6',
            });

            this.loadPagedRecetas();
          },
          error: (error) => {
            console.error('Error al eliminar receta:', error);
            Swal.fire({
              title: 'Error',
              text: error.error?.data || 'No se pudo eliminar la receta',
              icon: 'error',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#8b0000',
            });
          }
        });
      }
    });
  }

  public openEditarReceta(id: number | undefined) {
    if (id) {
      this.router.navigate(['/editar-recetas/', id]);
    } else {
      Swal.fire({
        title: 'Error',
        text: 'No se puede editar esta receta porque no tiene un ID válido',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#8b0000',
      });
    }
  }

  regresar() {
    this.location.back();
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
