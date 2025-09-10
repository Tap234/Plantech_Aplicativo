import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { authGuard } from './core/auth-guard'
import { HomeComponent } from './pages/home/home';
import { PlantaForm } from './pages/planta/planta-form/planta-form';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { adminGuard } from './core/admin-guard';
import { RegisterComponent } from './pages/register/register';


export const routes: Routes = [
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'login', component: Login},
    { path: 'register', component: RegisterComponent },

    {
        path: 'home',
        component: HomeComponent,
        canActivate: [authGuard]
    },

    {
        path: 'plantas/novo',
        component: PlantaForm,
        canActivate: [authGuard]
    },

    {
        path: 'plantas/editar/:id',
        component: PlantaForm,
        canActivate: [authGuard]
    },

    {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [authGuard, adminGuard]
    }
];

