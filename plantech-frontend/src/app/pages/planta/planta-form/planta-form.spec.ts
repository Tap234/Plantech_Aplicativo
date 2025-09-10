import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantaForm } from './planta-form';

describe('PlantaForm', () => {
  let component: PlantaForm;
  let fixture: ComponentFixture<PlantaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantaForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantaForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
