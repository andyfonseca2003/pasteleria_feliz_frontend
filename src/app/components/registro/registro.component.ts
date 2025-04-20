import { Component } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { CrearCuentaDTO } from '../../interfaces/Cuenta/crear-cuenta-dto';
import Swal from 'sweetalert2';
import { Router, RouterLink } from '@angular/router';
import { AsideComponent } from '../shared/aside/aside.component';
import { UserService } from '../../services/user.service';
import { CreateUserCommandDto } from '../../interfaces/user/create-user-command-dto';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AsideComponent],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  registroForm!: FormGroup;
  formTitle = 'Crear Usuario';

  constructor(private formBuilder: FormBuilder, private userService: UserService, private router: Router, private tokenService: TokenService) {
    this.crearFormulario();
  }

  private crearFormulario() {
    this.registroForm = this.formBuilder.group({
      typeDocument: ['CC', [Validators.required]],
      documentNumber: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      secondName: [''],
      lastName: ['', [Validators.required]],
      secondLastName: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.maxLength(10)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
      salary: 0,
      position: "Auxiliar",
      status: "ACTIVO",
      isAdmin: false,
      createdAt: new Date().toISOString(),  // Asigna la fecha actual en formato ISO
      updatedAt: new Date().toISOString(),  // También puedes hacer esto para `updatedAt`
      userModify: [this.tokenService.getIDCuenta()],
    }
    );
  }

  public registrar() {
    const crearCuenta = this.registroForm.value as CreateUserCommandDto;

    if (this.passwordsMatchValidator(this.registroForm) != null) {
      Swal.fire({
        title: 'Error',
        text: "Las contraseñas no coinciden",
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      })
    } else {
      this.userService.createUser(crearCuenta).subscribe({
        next: (data) => {
          Swal.fire({
            title: 'Cuenta creada',
            text: data.respuesta,
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          // this.router.navigate(["/activar-cuenta"]);
        },
        error: (error) => {
          Swal.fire({
            title: 'Error',
            text: error.error.respuesta,
            icon: 'error',
            confirmButtonText: 'Aceptar'
          })
        }
      });
    }
  }

  passwordsMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmaPassword = formGroup.get('confirmPassword')?.value;

    // Si las contraseñas no coinciden, devuelve un error, de lo contrario, null
    return password == confirmaPassword ? null : { passwordsMismatch: true };
  }
}