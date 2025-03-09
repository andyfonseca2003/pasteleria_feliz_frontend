import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { recuperarDTO } from '../../interfaces/Cuenta/recuperar-cuenta-dto';
import { AuthService } from '../../services/auth/auth.service';
import Swal from 'sweetalert2';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-recuperacion',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './recuperacion.component.html',
  styleUrl: './recuperacion.component.css'
})
export class RecuperacionComponent {
  recuperarCuenta!: FormGroup;

  constructor(private formBuilder: FormBuilder, private location: Location,
    private authService: AuthService, private router: Router,
  ) { 
    this.crearFormulario();
  }

  private crearFormulario() {
    this.recuperarCuenta = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    },
  );
  }

  public recuperarC() {
    const recuperarDTO = this.recuperarCuenta.value as { email: string };
    const email = recuperarDTO.email;
  
    if (!email) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingresa un email válido',
      });
      return;
    }
  
    this.authService.recuperarContrasena(email).subscribe({
      next: (data) => {
        // Mostrar mensaje satisfactorio
        Swal.fire({
          icon: 'success',
          title: 'Solicitud exitosa',
          text: 'Se ha enviado un código de recuperación a tu correo. Por favor revisa tu bandeja de entrada.',
          confirmButtonText: 'Ir a activar cuenta'
        }).then((result) => {
          if (result.isConfirmed) {
            // Redirigir a la página de activar cuenta
            this.router.navigate(['/activar-cuenta']);
          }
        });
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error.respuesta || 'Ocurrió un error al enviar el código de recuperación',
        });
      },
    });
  }
  
  



  public recuperar() {
    console.log(this.recuperarCuenta.value);
  }

      // Método para regresar a la página anterior
      regresar() {
        this.location.back();
      }
}
