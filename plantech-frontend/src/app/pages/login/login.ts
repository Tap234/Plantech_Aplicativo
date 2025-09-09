import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  loginData = {
    username: '',
    password: ''
  };
  constructor(private authService: AuthService) {}
  
  onSubmit() {
    console.log('Enviando para API:', this.loginData).subscribe({
      next: (response) => {
        console.log('Login bem-sucedido:', response);
      },
      error: (erro) => {
        console.error('Erro no login:', erro);
        alert('Falha no login. Verifique suas credenciais.');
      }
    });
  }
}