import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { TokenService } from '../../../services/token.service';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [RouterModule, RouterLink],
  templateUrl: './aside.component.html',
  styleUrl: './aside.component.css'
})
export class AsideComponent {
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
