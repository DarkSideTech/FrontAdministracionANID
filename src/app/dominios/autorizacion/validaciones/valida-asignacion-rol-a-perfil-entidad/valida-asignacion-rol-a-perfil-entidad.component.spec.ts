import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidaAsignacionRolAPerfilEntidadComponent } from './valida-asignacion-rol-a-perfil-entidad.component';

describe('ValidaAsignacionRolAPerfilEntidadComponent', () => {
  let component: ValidaAsignacionRolAPerfilEntidadComponent;
  let fixture: ComponentFixture<ValidaAsignacionRolAPerfilEntidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidaAsignacionRolAPerfilEntidadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidaAsignacionRolAPerfilEntidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
