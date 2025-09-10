import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth';
import { jwtDecode } from 'jwt-decode';

interface AuthToken { sub: string; roles: string; iat: number; exp: number; }

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {

  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    const token = this.authService.getToken();
    if (!token) return false;
    try {
      const decodedToken: AuthToken = jwtDecode(token);
      return decodedToken.roles.includes('ROLE_ADMIN');
    } catch (error) {
      return false;
    }
  }
}