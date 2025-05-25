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

import { EditarUsuariosComponent } from './components/editar-usuarios/editar-usuarios.component';
import { ListarRecetasComponent } from './components/listar-recetas/listar-recetas.component';
import { CrearRecetasComponent } from './components/crear-recetas/crear-recetas.component';
import { EditarRecetasComponent } from './components/editar-recetas/editar-recetas.component';
import { ListarCakeOrdersComponent } from './components/listar-cake-orders/listar-cake-orders.component';
import { CrearCakeOrderComponent } from './components/crear-cake-orders/crear-cake-orders.component';
import { EditarCakeOrderComponent } from './components/editar-cake-orders/editar-cake-orders.component';

export const routes: Routes = [

  // Access
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'activar-cuenta', component: ActivarCuentaComponent, canActivate: [LoginGuard] },
  { path: 'cambio', component: CambioComponent, canActivate: [LoginGuard] },
  { path: 'recuperacion', component: RecuperacionComponent, canActivate: [LoginGuard] },

  // admin
  { path: 'administrador', component: AdministradorComponent, canActivate: [RolesGuard] },

  // Rutas de insumos
  { path: 'listar-insumos', component: ListarInsumosComponent, canActivate: [RolesGuard] },
  { path: 'crear-insumos', component: CrearInsumosComponent, canActivate: [RolesGuard] },
  { path: 'editar-insumos/:id', component: EditarInsumosComponent, canActivate: [RolesGuard] },

  // Rutas de insumos
  { path: 'listar-recetas', component: ListarRecetasComponent, canActivate: [RolesGuard] },
  { path: 'crear-recetas', component: CrearRecetasComponent, canActivate: [RolesGuard] },
  { path: 'editar-recetas/:id', component: EditarRecetasComponent, canActivate: [RolesGuard] },

  // Rutas de proveedores
  { path: 'listar-suppliers', component: ListarSuppliersComponent, canActivate: [RolesGuard] },
  { path: 'crear-suppliers', component: CrearSupplierComponent, canActivate: [RolesGuard] },
  { path: 'editar-suppliers/:id', component: EditarSupplierComponent, canActivate: [RolesGuard] },
  
  // Rutas de Ordenes
  { path: 'listar-ordenes', component: ListarCakeOrdersComponent, canActivate: [RolesGuard] },
  { path: 'crear-orden', component: CrearCakeOrderComponent, canActivate: [RolesGuard] },
  { path: 'editar-orden/:id', component: EditarCakeOrderComponent, canActivate: [RolesGuard]},  
  
  // Ruta para users
  { path: 'registro', component: RegistroComponent, canActivate: [RolesGuard], data: { roles: ['ADMIN'] } },
  { path: 'listar-usuarios', component: ListarUsuariosComponent, canActivate: [RolesGuard], data: { roles: ['ADMIN'] } },
  { path: 'editar-usuarios/:id', component: EditarUsuariosComponent, canActivate: [RolesGuard], data: { roles: ['ADMIN'] } },
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: "**", pathMatch: "full", redirectTo: "login" },
];
