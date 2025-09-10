import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, User } from './admin';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {

  users: User[] = [];
  currentUserEmail: string | null = null;

  constructor(private adminService: AdminService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.currentUserEmail = this.authService.getCurrentUserEmail();
  }

  loadUsers(): void {
    this.adminService.getUsers().subscribe(data => {
      this.users = data;
    });
  }

  promoteUser(id: number): void {
    if (confirm('Tem certeza que deseja promover este usuário a Administrador?')) {
      this.adminService.promoteUser(id).subscribe({
        next: () => {
          alert('Usuário promovido com sucesso!');
          this.loadUsers();
        },
        error: (err) => {
          alert('Erro ao promover usuário.');
          console.error(err);
        }
      });
    }
  }

  deleteUser(id: number): void {
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      this.adminService.deleteUser(id).subscribe({
        next: () => {
          alert('Usuário deletado com sucesso!');
          this.loadUsers();
        },
        error: (err) => {
          alert('Erro ao deletar usuário.');
          console.error(err);
        }
      });
    }
  }

  demoteUser(id: number): void {
  if (confirm('Tem certeza que deseja revogar os privilégios de Administrador deste usuário?')) {
    this.adminService.demoteUser(id).subscribe({
      next: () => {
        alert('Privilégios de Administrador revogados com sucesso!');
        this.loadUsers();
      },
      error: (err) => {
        alert('Erro ao revogar privilégios.');
        console.error(err);
      }
    });
  }
  }
}