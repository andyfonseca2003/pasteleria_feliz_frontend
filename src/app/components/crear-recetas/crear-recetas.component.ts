import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { AsideComponent } from '../shared/aside/aside.component';
import Swal from 'sweetalert2';
import { RecetaService } from '../../services/receta.service';

@Component({
  selector: 'app-crear-recetas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AsideComponent
  ],
  providers: [],
  templateUrl: './crear-recetas.component.html',
  styleUrl: './crear-recetas.component.css'
})

export class CrearRecetasComponent implements OnInit {
  recipeForm!: FormGroup;
  isEditing = false;
  formTitle = 'Crear Receta';
  submitButtonText = 'Guardar';

  constructor(
    private fb: FormBuilder,
    private recipeService: RecetaService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.recipeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      preparationTimeMinutes: [0],
      portions: [1],
      status: ['ACTIVO']
    });
  }

  onSubmit(): void {
    if (this.recipeForm.invalid) {
      Object.keys(this.recipeForm.controls).forEach(key => {
        const control = this.recipeForm.get(key);
        control?.markAsTouched();
      });

      Swal.fire('Error', 'Por favor, complete todos los campos requeridos correctamente', 'error');
      return;
    }

    const formData = this.recipeForm.value;

    const recipeData: any = {
      name: formData.name,
      description: formData.description,
      preparationTimeMinutes: formData.preparationTimeMinutes,
      portions: formData.portions,
      status: formData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const currentUser = this.getUserFromStorage();
    if (currentUser && currentUser.id) {
      recipeData.userModify = currentUser.id;
    }

    this.recipeService.createReceta(recipeData).subscribe({
      next: (response) => {
        if (response.error) {
          Swal.fire('Error', response.respuesta || 'Error al crear la receta', 'error');
          return;
        }

        Swal.fire('Éxito', 'Receta creada correctamente', 'success');
        this.router.navigate(['/listar-recetas']);
      },
      error: (error) => {
        console.error('Error al crear receta:', error);
        Swal.fire('Error', error.error?.message || 'Error al crear la receta', 'error');
      }
    });
  }

  regresar(): void {
    this.location.back();
  }

  private getUserFromStorage(): any {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
}
