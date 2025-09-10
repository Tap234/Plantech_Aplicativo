import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css', '../../shared/style/form.styles.css']
})
export class RegisterComponent {
  userData = {
    nome: '',
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.authService.register(this.userData).subscribe({
      next: (response) => {
        alert('Usuário cadastrado com sucesso! Por favor, faça o login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert('Erro ao cadastrar usuário. Verifique os dados e tente novamente.');
        console.error(err);
      }
    });
  }
}