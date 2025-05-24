import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AsideComponent } from '../shared/aside/aside.component';
import { UserService } from '../../services/user.service';
import { UpdateUserCommandDto } from '../../interfaces/user/update-user-command-dto';
import { Status } from '../../interfaces/user/status.enum';
import { TypeDocument } from '../../interfaces/user/type-document.enum';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AsideComponent
  ],
  templateUrl: './editar-usuario.component.html',
  styleUrl: './editar-usuario.component.css'
})
export class EditarUsuarioComponent implements OnInit {
  userForm!: FormGroup;
  userId!: number;
  isLoading: boolean = false;
  tiposDocumento = Object.values(TypeDocument);
  estados = Object.values(Status);
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Inicializar el formulario vacío
    this.initForm();
    
    // Obtener el ID del usuario de la URL
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.userId = +params['id'];
        this.loadUserData();
      } else {
        this.showError('ID de usuario no válido');
        this.router.navigate(['/listar-usuarios']);
      }
    });
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      typeDocument: ['', Validators.required],
      documentNumber: ['', Validators.required],
      phone: ['', Validators.required],
      position: [''],
      salary: [null],
      firstName: ['', Validators.required],
      secondName: [''],
      lastName: ['', Validators.required],
      secondLastName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      status: [Status.ACTIVE],
      isAdmin: [false]
    });
  }

  private loadUserData(): void {
    this.isLoading = true;
    
    this.userService.getUser(this.userId).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.error) {
          this.showError(response.respuesta || 'No se pudo cargar los datos del usuario');
          return;
        }
        
        const userData = response.respuesta;
        
        // Mapear los datos del backend al formato del formulario
        this.userForm.patchValue({
          typeDocument: userData.typeDocument,
          documentNumber: userData.documentNumber,
          phone: userData.phone,
          position: userData.position,
          salary: userData.salary,
          firstName: userData.first_name,
          secondName: userData.second_name,
          lastName: userData.last_name,
          secondLastName: userData.second_last_name,
          email: userData.email,
          status: userData.status,
          isAdmin: userData.isAdmin
        });
        
        // Deshabilitar campos que no deberían cambiar
        this.userForm.get('documentNumber')?.disable();
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error.error?.respuesta || 'Error al cargar los datos del usuario');
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      this.showError('Por favor, complete todos los campos requeridos correctamente');
      return;
    }
    
    this.isLoading = true;
    
    // Construir el objeto UpdateUserCommandDto
    const formData = this.userForm.value;
    
    const updateData: UpdateUserCommandDto = {
      id: this.userId,
      typeDocument: formData.typeDocument,
      documentNumber: this.userForm.get('documentNumber')?.value,
      phone: formData.phone,
      position: formData.position || '',
      salary: formData.salary || null,
      firstName: formData.firstName,
      secondName: formData.secondName || '',
      lastName: formData.lastName,
      secondLastName: formData.secondLastName || '',
      email: formData.email,
      // Solo incluir password si no está vacío
      password: formData.password && formData.password.trim() !== '' ? formData.password : null,
      status: formData.status,
      isAdmin: formData.isAdmin,
      updatedAt: new Date().toISOString()
    };
    
    console.log('Datos de actualización:', updateData); // Log para depuración
    
    this.userService.updateUser(this.userId, updateData).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.error) {
          this.showError(response.respuesta || 'No se pudo actualizar el usuario');
          return;
        }
        
        Swal.fire({
          title: 'Éxito',
          text: 'Usuario actualizado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.router.navigate(['/listar-usuarios']);
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.showError(error.error?.respuesta || 'Error al actualizar el usuario');
      }
    });
  }

  private showError(message: string): void {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#8b0000',
    });
  }

  cancelar(): void {
    this.router.navigate(['/listar-usuarios']);
  }
}