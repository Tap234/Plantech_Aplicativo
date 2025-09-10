import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
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
      
      localStorage.setItem('authToken', response.token); 

      this.router.navigate(['/home']);
      
    },
    error: (err: any) => {
      console.error('Erro no login:', err);
      alert('E-mail ou senha incorretos.');
    }
  });
}
}