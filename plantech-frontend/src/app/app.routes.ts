import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { authGuard } from './core/auth-guard'
import { Home } from './pages/home/home';

export const routes: Routes = [
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'login', component: Login},

    {
        path: 'home',
        component: Home,
        canActivate: [authGuard]
    }
];
