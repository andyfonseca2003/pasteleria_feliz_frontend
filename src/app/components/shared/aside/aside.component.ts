import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [RouterModule,RouterLink],
  templateUrl: './aside.component.html',
  styleUrl: './aside.component.css'
})
export class AsideComponent {}
