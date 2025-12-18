import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignaPerfilAValidaEnrrolamientoComponent } from './asigna-perfil-a-valida-enrrolamiento.component';

describe('AsignaPerfilAValidaEnrrolamientoComponent', () => {
  let component: AsignaPerfilAValidaEnrrolamientoComponent;
  let fixture: ComponentFixture<AsignaPerfilAValidaEnrrolamientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignaPerfilAValidaEnrrolamientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignaPerfilAValidaEnrrolamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
