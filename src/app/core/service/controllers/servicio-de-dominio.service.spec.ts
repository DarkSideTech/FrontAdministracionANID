import { TestBed } from '@angular/core/testing';

import { ServicioDeDominioService } from './servicio-de-dominio.service';

describe('ServicioDeDominioService', () => {
  let service: ServicioDeDominioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicioDeDominioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
