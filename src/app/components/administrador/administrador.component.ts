import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './administrador.component.html',
  styleUrl: './administrador.component.css'
})
export class AdministradorComponent {
 isAdmin: boolean = false;
  isLogged = false;

  constructor(private tokenService: TokenService) {
    this.tokenService.nombreUsuario$.subscribe((nombre) => {
      this.isLogged = this.tokenService.isLogged();
      if (this.isLogged) {
        this.isAdmin = this.tokenService.getIsAdmin();
      }
    });

  }
}
