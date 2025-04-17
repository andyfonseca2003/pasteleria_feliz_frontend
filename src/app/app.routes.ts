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
import { EditarInsumosComponent } from './components/editar-insumos/editar-insumos.component';
import { ListarSuppliersComponent } from './components/listar-suppliers/listar-suppliers.component'; // NUEVA IMPORTACIÓN
import { CrearSupplierComponent } from './components/crear-supplier/crear-supplier.component';

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
  { path: 'editar-insumos/:id', component: EditarInsumosComponent,
    //canActivate: [RolesGuard], data: { expectedRole: ["ADMINISTRADOR"] }
  },

  // NUEVA RUTA AÑADIDA PARA LISTAR SUPPLIERS
  { path: 'listar-suppliers', component: ListarSuppliersComponent,
    //canActivate: [RolesGuard], data: { expectedRole: ["ADMINISTRADOR"] }
  },
  { path: 'crear-suppliers', component: CrearSupplierComponent,
    //canActivate: [RolesGuard], data: { expectedRole: ["ADMINISTRADOR"] }
  },
  { path: "**", pathMatch: "full", redirectTo: "login" },
];
