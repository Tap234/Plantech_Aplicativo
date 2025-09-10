import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth';
import { Router, RouterModule } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

interface AuthToken {
  roles: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loginData = {
    email: '',
    password: ''
  };
  constructor(private authService: AuthService, private router: Router) {}
  
  onSubmit() {
    this.authService.login(this.loginData).subscribe({
      next: (response: any) => {
        console.log('Login bem-sucedido!', response);
        const token = response.token;
        localStorage.setItem('authToken', token);
        
        try {
          const decodedToken: AuthToken = jwtDecode(token);
          if (decodedToken.roles.includes('ROLE_ADMIN')) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/home']);
          }
        } catch (error) {
          console.error('Erro ao decodificar token, redirecionando para home', error);
          this.router.navigate(['/home']);
        }

      },
      error: (err: any) => {
        console.error('Erro no login:', err);
        alert('E-mail ou senha incorretos.');
      }
    });
  }
}