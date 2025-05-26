import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import Swal from 'sweetalert2';
import { LoginDTO } from '../../interfaces/Cuenta/login-dto';
import { TokenService } from '../../services/token.service';
import { RecaptchaModule } from 'ng-recaptcha';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule,RecaptchaModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  crearLogin!: FormGroup;
  captchaToken: string | null = null;
  mostrarCaptcha = true; // Puedes activar esto dinámicamente tras varios errores
  errorMsg: string | null = "";
  alerta = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private tokenService: TokenService,
    private route: ActivatedRoute) {
    this.mostrarError();
    this.crearFormulario();
  }

  private crearFormulario() {
    this.crearLogin = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.maxLength(20), Validators.minLength(6)]],
    },
    );
  }

  captchaResolved(token: string) {
    this.captchaToken = token;
  }

  private mostrarError() {
    this.errorMsg = this.route.snapshot.queryParamMap.get('mensaje');
    if (this.errorMsg) {
      this.alerta = false;
    }
  }


  public iniciar() {
    const loginDTO = this.crearLogin.value as LoginDTO;

    this.authService.iniciarSesion(loginDTO).subscribe({
      next: (data) => {
        this.tokenService.login(data.respuesta.token);
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error.respuesta.token
        });
      },
    });
  }

  public abrirGoogle() {
    window.location.href = 'https://pasteleria-v6wz.onrender.com/oauth2/authorization/google';
  }
}
