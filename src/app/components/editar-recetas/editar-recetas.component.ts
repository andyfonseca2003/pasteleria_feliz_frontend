import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { TokenService } from '../../services/token.service';
import Swal from 'sweetalert2';
import { AsideComponent } from '../shared/aside/aside.component';
import { RecetaService } from '../../services/receta.service';

@Component({
  selector: 'app-editar-recetas',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    AsideComponent
  ],
  templateUrl: './editar-recetas.component.html',
  styleUrl: './editar-recetas.component.css'
})
export class EditarRecetasComponent implements OnInit {
  formTitle = 'Editar Receta';
  submitButtonText = 'Actualizar Receta';
  recipeForm!: FormGroup;
  recipeId: number = 0;
  loading: boolean = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private recipeService: RecetaService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.recipeId = parseInt(id, 10);
        this.loadRecipeData(this.recipeId);
      } else {
        Swal.fire('Error', 'No se encontró el ID de la receta', 'error');
        this.router.navigate(['/listar-recetas']);
      }
    });
  }

  private initForm(): void {
    this.recipeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      preparationTimeMinutes: [0, [Validators.required, Validators.min(1)]],
      portions: [1, [Validators.required, Validators.min(1)]],
      status: ['ACTIVO', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      updatedAt: new Date().toISOString()
    });
  }

  private loadRecipeData(id: number): void {
    this.recipeService.getReceta(id).subscribe({
      next: (data) => {
        if (data.error) {
          Swal.fire('Error', data.respuesta || 'No se pudo cargar la receta', 'error');
          this.router.navigate(['/listar-recetas']);
          return;
        }

        const recipe = data.respuesta;

        this.recipeForm.patchValue({
          name: recipe.name || '',
          preparationTimeMinutes: recipe.preparationTimeMinutes ?? 0,
          portions: recipe.portions ?? 1,
          status: recipe.status || 'ACTIVO',
          description: recipe.description || '',
          updatedAt: new Date().toISOString()
        });

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar la receta:', error);
        Swal.fire('Error', 'No se pudo cargar la receta', 'error');
        this.router.navigate(['/listar-recetas']);
      }
    });
  }

  onSubmit(): void {
    if (this.recipeForm.invalid) {
      Object.keys(this.recipeForm.controls).forEach(key => {
        this.recipeForm.get(key)?.markAsTouched();
      });
      Swal.fire('Error', 'Por favor, complete todos los campos correctamente', 'error');
      return;
    }

    const recipeData = {
      ...this.recipeForm.value,
      id: this.recipeId,
      userModify: this.tokenService.getIDCuenta()
    };

    this.recipeService.updateReceta(this.recipeId, recipeData).subscribe({
      next: (data) => {
        if (data.error) {
          Swal.fire('Error', data.respuesta || 'No se pudo actualizar la receta', 'error');
          return;
        }

        Swal.fire('Éxito', 'Receta actualizada correctamente', 'success');
        this.router.navigate(['/listar-recetas']);
      },
      error: (err) => {
        console.error('Error al actualizar receta:', err);
        Swal.fire('Error', 'No se pudo actualizar la receta', 'error');
      }
    });
  }

  regresar(): void {
    this.location.back();
  }
}
