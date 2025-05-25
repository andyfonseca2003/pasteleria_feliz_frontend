import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { ActivarCuentaDTO } from '../../interfaces/Cuenta/activar-cuenta-dto';
import { AuthService } from '../../services/auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-activar-cuenta',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './activar-cuenta.component.html',
  styleUrl: './activar-cuenta.component.css'
})
export class ActivarCuentaComponent {
  cambioPassword!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private location: Location,
    private authService: AuthService,
    private router: Router) {
    this.crearFormulario();
  }

  private crearFormulario() {
    this.cambioPassword = this.formBuilder.group({
      codigoVerificacion: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      passwordNueva: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(7)]],
      confirmarPassword: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(7)]],
    },
      { validators: this.passwordsMatchValidator } as AbstractControlOptions
    );
  }

  public cambiar() {
    const activarCuenta = this.cambioPassword.value as ActivarCuentaDTO;

    this.authService.activarCuenta(activarCuenta).subscribe({
      next: (data) => {
        Swal.fire({
          title: 'Cuenta activada',
          text: data.respuesta,
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.router.navigate(["/login"]);
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

  passwordsMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('passwordNueva')?.value;
    const confirmaPassword = formGroup.get('confirmarPassword')?.value;

    // Si las contraseñas no coinciden, devuelve un error, de lo contrario, null
    return password == confirmaPassword ? null : { passwordsMismatch: true };
  }
  regresar() {
    this.location.back();
  }
}
