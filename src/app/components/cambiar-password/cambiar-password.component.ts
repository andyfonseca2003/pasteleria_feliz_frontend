import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth/auth.service';
import { CambiarPassword } from '../../interfaces/user/cambiar-password';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './cambiar-password.component.html',
  styleUrl: './cambiar-password.component.css'
})
export class CambiarPasswordComponent {

  codigoActivacion: string = '';
  email: string = '';
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onActualizar(): void {
    if (this.nuevaContrasena !== this.confirmarContrasena) {
      // Reemplazando la alerta anterior con Swal
      Swal.fire({
        title: 'Error',
        text: 'Las contraseñas no coinciden',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#8b0000',
      });
      return;
    }

    const cambiarPasswordDTO: CambiarPassword = {
      email: this.email,
      codigoVerificacion: this.codigoActivacion,
      passwordNueva: this.nuevaContrasena
    };

    this.authService.recuperarContrasena(cambiarPasswordDTO.email).subscribe({
      next: (data) => {
        Swal.fire({
          title: 'Actualizar contraseña',
          text: data.respuesta,
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#065f46',
        });

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        Swal.fire({
          title: 'Actualizar contraseña',
          text: error.error.respuesta,
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#8b0000',
        });
      }
    });
  }
}