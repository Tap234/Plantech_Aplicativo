import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Planta } from '../planta.model';
import { PlantaService } from '../planta';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-planta-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './planta-form.html',
  styleUrls: ['./planta-form.css', '../../../shared/style/form.styles.css']
})
export class PlantaForm implements OnInit {
  planta: Planta = {
    id: 0,
    nome: '',
    descricao: ''
  };
  isEditMode: boolean = false;

  constructor(
    private plantaService: PlantaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.plantaService.getPlantaById(+id).subscribe({
        next: (data) => {
          this.planta = data;
        },
        error: (err) => {
          console.error('Erro ao carregar planta:', err);
          alert('Não foi possível carregar a planta.');
          this.router.navigate(['/home']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.isEditMode) {
      this.plantaService.updatePlanta(this.planta.id, this.planta).subscribe({
        next: () => {
          alert('Planta atualizada com sucesso!');
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Erro ao atualizar planta:', err);
          alert('Não foi possível atualizar a planta.');
        }
      });
    } else {
      this.plantaService.createPlanta(this.planta).subscribe({
        next: () => {
          alert('Planta adicionada com sucesso!');
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Erro ao adicionar planta:', err);
          alert('Não foi possível adicionar a planta.');
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/home']);
  }
}