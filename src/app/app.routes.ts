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
import { EditarSupplierComponent } from './components/editar-supplier/editar-supplier.component';
import { ListarUsuariosComponent } from './components/listar-usuarios/listar-usuarios.component';
import { EditarUsuarioComponent } from './components/editar-usuario/editar-usuario.component';
import { EditarCakeOrderComponent } from './components/editar-cake-orders/editar-cake-orders.component';
import { ListarCakeOrdersComponent } from './components/listar-cake-orders/listar-cake-orders.component';
import { CrearCakeOrderComponent } from './components/crear-cake-orders/crear-cake-orders.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'activar-cuenta', component: ActivarCuentaComponent, canActivate: [LoginGuard] },
  { path: 'cambio', component: CambioComponent, canActivate: [LoginGuard] },
  { path: 'recuperacion', component: RecuperacionComponent, canActivate: [LoginGuard] },

  {
    path: 'administrador', component: AdministradorComponent, canActivate: [RolesGuard],
    //data: { expectedRole: ["ADMINISTRADOR"] }
  },

  // Rutas de insumos
  {
    path: 'listar-insumos', component: ListarInsumosComponent, canActivate: [RolesGuard]
    //, data: { expectedRole: ["ADMINISTRADOR"] }
  },
  {
    path: 'crear-insumos', component: CrearInsumosComponent, canActivate: [RolesGuard],
    // data: { expectedRole: ["ADMINISTRADOR"] }
  },
  {
    path: 'editar-insumos/:id', component: EditarInsumosComponent, canActivate: [RolesGuard],
    //data: { expectedRole: ["ADMINISTRADOR"] }
  },

  // NUEVA RUTA AÑADIDA PARA LISTAR SUPPLIERS
  {
    path: 'listar-suppliers', component: ListarSuppliersComponent, canActivate: [RolesGuard]
    //, data: { expectedRole: ["ADMINISTRADOR"] }
  },
  {
    path: 'crear-suppliers', component: CrearSupplierComponent, canActivate: [RolesGuard]
    //, data: { expectedRole: ["ADMINISTRADOR"] }
  },
  {
    path: 'editar-suppliers/:id', component: EditarSupplierComponent, canActivate: [RolesGuard],
    // data: { expectedRole: ["ADMINISTRADOR"] }
  },
  {
    path: 'listar-ordenes', component: ListarCakeOrdersComponent, canActivate: [RolesGuard]
  },
  {
    path: 'crear-orden', component: CrearCakeOrderComponent, canActivate: [RolesGuard]
  },
  {
    path: 'editar-orden/:id', component: EditarCakeOrderComponent, canActivate: [RolesGuard]
  },

  // Ruta para users
  { path: 'registro', component: RegistroComponent, canActivate: [RolesGuard], },
  { path: 'listar-usuarios', component: ListarUsuariosComponent, canActivate: [RolesGuard], },
  { path: 'editar-usuarios/:id', component: EditarUsuarioComponent, canActivate: [RolesGuard], },


  { path: "**", pathMatch: "full", redirectTo: "login" },
];
