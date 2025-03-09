import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { ActivarCuentaComponent } from './components/activar-cuenta/activar-cuenta.component';
import { CambioComponent } from './components/cambio/cambio.component';
import { RecuperacionComponent } from './components/recuperacion/recuperacion.component';
import { AdministradorComponent } from './components/administrador/administrador.component';

import { LoginGuard } from './services/guards/permiso.service';
import { RolesGuard } from './services/guards/roles.service';
import { ListarInsumosComponent } from './components/listar-insumos/listar-insumos.component';
import { CrearInsumosComponent } from './components/crear-insumos/crear-insumos.component';


export const routes: Routes = [
   { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
   { path: 'registro', component: RegistroComponent, canActivate: [LoginGuard] },
   { path: 'activar-cuenta', component: ActivarCuentaComponent, canActivate: [LoginGuard] },
   { path: 'cambio', component: CambioComponent, canActivate: [LoginGuard] },
   { path: 'recuperacion', component: RecuperacionComponent, canActivate: [LoginGuard] },

   {
      path: 'administrador', component: AdministradorComponent,
      //canActivate: [RolesGuard], 
      //data: { expectedRole: ["ADMINISTRADOR"] } 
   },

   { path: 'listar-insumos', component: ListarInsumosComponent, 
      //canActivate: [RolesGuard], data: { expectedRole: ["ADMINISTRADOR"] } 
   },
   { path: 'crear-insumos', component: CrearInsumosComponent, 
      //canActivate: [RolesGuard], data: { expectedRole: ["ADMINISTRADOR"] } 
   },
   // { path: 'editar-cupones/:id', component: EditarCuponesComponent, canActivate: [RolesGuard], data: { expectedRole: ["ADMINISTRADOR"] } },
   { path: "**", pathMatch: "full", redirectTo: "login" },

];
