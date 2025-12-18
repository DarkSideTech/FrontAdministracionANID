import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreaPerfilUsuarioEntidadComponent } from './crea-perfil-usuario-entidad.component';

describe('CreaPerfilUsuarioEntidadComponent', () => {
  let component: CreaPerfilUsuarioEntidadComponent;
  let fixture: ComponentFixture<CreaPerfilUsuarioEntidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreaPerfilUsuarioEntidadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreaPerfilUsuarioEntidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
