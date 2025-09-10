import { TestBed } from '@angular/core/testing';

import { Planta } from './planta';

describe('Planta', () => {
  let service: Planta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Planta);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
