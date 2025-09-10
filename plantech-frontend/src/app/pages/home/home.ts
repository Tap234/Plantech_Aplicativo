import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlantaService } from '../planta/planta';
import { Planta } from '../planta/planta.model';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {

  plantas: Planta[] = [];

  constructor(private plantaService: PlantaService) {}

  ngOnInit(): void {
    this.carregarPlantas();
  }

  carregarPlantas(): void {
    this.plantaService.getPlantas().subscribe({
      next: (data) => {
        this.plantas = data;
        console.log('Plantas carregadas:', this.plantas);
      },
      error: (err) => {
        console.error('Erro ao carregar plantas:', err);
      }
    });
  }

  deletarPlanta(id: number): void {
  const confirmacao = confirm('Tem certeza que deseja excluir esta planta?');

  if (confirmacao) {
    this.plantaService.deletePlanta(id).subscribe({
      next: () => {
        alert('Planta excluída com sucesso!');
        this.carregarPlantas(); 
      },
      error: (err) => {
        console.error('Erro ao excluir planta:', err);
        alert('Não foi possível excluir a planta.');
      }
    });
  }
}
}