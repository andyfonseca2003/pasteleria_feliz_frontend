import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { ActivarCuentaComponent } from './components/activar-cuenta/activar-cuenta.component';
import { CambioComponent } from './components/cambio/cambio.component';
import { RecuperacionComponent } from './components/recuperacion/recuperacion.component';
import { AdministradorComponent } from './components/administrador/administrador.component';

export const routes: Routes = [
   { path: 'login', component: LoginComponent, 
    //canActivate: [LoginGuard] 

   },
   { path: 'registro', component: RegistroComponent, 
    //canActivate: [LoginGuard] 

   },
   { path: 'activar-cuenta', component: ActivarCuentaComponent, 
    //canActivate: [LoginGuard]

   },
   { path: 'cambio', component: CambioComponent, 
    //canActivate: [LoginGuard] 

   },
   { path: 'recuperacion', component: RecuperacionComponent, 
    //canActivate: [LoginGuard] 
    },

   { path: 'administrador', component: AdministradorComponent, 
    //canActivate: [RolesGuard], data: { expectedRole: ["ADMINISTRADOR"] } 
    },

   { path: "**", pathMatch: "full", redirectTo: "login" },

];
