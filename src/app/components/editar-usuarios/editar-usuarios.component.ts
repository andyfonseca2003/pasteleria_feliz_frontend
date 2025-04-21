import { Component, OnInit } from '@angular/core';
import { AsideComponent } from '../shared/aside/aside.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import Swal from 'sweetalert2';
import { UserService } from '../../services/user.service';
import { UserBackendResponse } from '../../interfaces/user/user-backend-response';
import { CommonModule, Location, NgClass } from '@angular/common';
import { UpdateUserCommandDto } from '../../interfaces/user/update-user-command-dto';
import { UserUpdateResponse } from '../../interfaces/user/user-update-response-dto';

@Component({
  selector: 'app-editar-usuarios',
  imports: [
    AsideComponent,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './editar-usuarios.component.html',
  styleUrl: './editar-usuarios.component.css'
})
export class EditarUsuariosComponent implements OnInit {
  formTitle = 'Editar usuario';
  userForm!: FormGroup;
  userId: number = 0;
  loading: boolean = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private tokenService: TokenService,
    private userService: UserService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.userId = parseInt(id);
        this.loadUserData(this.userId);
      } else {
        Swal.fire({
          title: 'Error',
          text: 'No se encontró el ID del usuario',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#8b0000',
        });
        this.router.navigate(['/listar-usuarios']);
      }
    });
  }

  private initForm(): void {
    this.userForm = this.fb.group({
      typeDocument: ['CC', [Validators.required]],
      documentNumber: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      secondName: [''],
      lastName: ['', [Validators.required]],
      secondLastName: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.maxLength(10)]],
      salary: 0,
      position: "Auxiliar",
      status: "ACTIVO",
      isAdmin: false,
      updatedAt: new Date().toISOString()
    });
  }

  loadUserData(id: number): void {
    this.loading = true;

    this.userService.getUser(id).subscribe({
      next: (data) => {
        if (data.error) {
          Swal.fire({
            title: 'Error',
            text: data.respuesta || 'No se pudo cargar la información del usuario',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#8b0000',
          });
          this.router.navigate(['/listar-usuarios']);
          return;
        }

        const user = data.respuesta;
        console.log('Datos del usuario recibidos:', user);

        const formData: UserUpdateResponse = {
          typeDocument: user.typeDocument || 'CC',
          documentNumber: user.documentNumber || '',
          firstName: user.first_name || '',
          secondName: user.second_name || '',
          lastName: user.last_name || '',
          secondLastName: user.second_last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          salary: user.salary ?? 0, // Usa ?? para permitir 0 como valor válido
          position: user.position || 'Auxiliar',
          status: user.status || 'ACTIVO',
          isAdmin: user.isAdmin ?? false,
          createdAt: user.createdAt || new Date().toISOString(),
          updatedAt: user.updatedAt || new Date().toISOString(),
        };

        this.userForm.patchValue(formData);

        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos del usuario:', error);
        Swal.fire({
          title: 'Error',
          text: error.error?.data || 'No se pudo cargar la información del usuario',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#8b0000',
        });
        this.loading = false;
        this.router.navigate(['/listar-usuarios']);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        control?.markAsTouched();
      });

      Swal.fire('Error', 'Por favor, complete todos los campos requeridos correctamente', 'error');
      return;
    }

    const formData: UpdateUserCommandDto = this.userForm.value;

    const userData: any = {
      // Identificación
      id: this.userId,
      typeDocument: formData.typeDocument,
      documentNumber: formData.documentNumber,

      // Nombres y apellidos
      firstName: formData.firstName,
      secondName: formData.secondName,
      lastName: formData.lastName,
      secondLastName: formData.secondLastName,

      // Contacto
      email: formData.email,
      phone: formData.phone,

      // Estado y auditoría
      status: "ACTIVO",
      updatedAt: new Date().toISOString()
    };

    const currentUserId = this.tokenService.getIDCuenta();
    if (currentUserId) {
      userData.userModify = currentUserId;
    }

    this.userService.updateUser(this.userId, userData).subscribe({
      next: (data) => {
        if (data.error) {
          Swal.fire({
            title: 'Error',
            text: data.respuesta || 'Error al actualizar el usuario',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#8b0000',
          });
          return;
        }

        Swal.fire({
          title: 'Éxito',
          text: 'Usuario actualizado correctamente',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#065f46',
        });
        this.router.navigate(['/listar-usuarios']);
      },
      error: (error) => {
        console.error('Error al actualizar usuario:', error);
      }
    });
  }
  
  regresar(): void {
    this.location.back();
  }

}
