import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-cambio',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './cambio.component.html',
  styleUrl: './cambio.component.css'
})
export class CambioComponent {
  cambioPassword!: FormGroup;

  constructor(private formBuilder: FormBuilder, private location: Location) { 
    this.crearFormulario();
  }

  private crearFormulario() {
    this.cambioPassword = this.formBuilder.group({
      codigo: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(7)]],
      confirmarPassword: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(7)]],
    },
    { validators: this.passwordsMatchValidator } as AbstractControlOptions
  );
  }

  public cambiar() {
    console.log(this.cambioPassword.value);
  }

  passwordsMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmaPassword = formGroup.get('confirmarPassword')?.value;

    // Si las contraseñas no coinciden, devuelve un error, de lo contrario, null
    return password == confirmaPassword ? null : { passwordsMismatch: true };
  }
  regresar() {
    this.location.back();
  }
}
