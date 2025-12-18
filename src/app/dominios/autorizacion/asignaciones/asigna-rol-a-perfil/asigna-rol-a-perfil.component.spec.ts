import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignaRolAPerfilComponent } from './asigna-rol-a-perfil.component';

describe('AsignaRolAPerfilComponent', () => {
  let component: AsignaRolAPerfilComponent;
  let fixture: ComponentFixture<AsignaRolAPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignaRolAPerfilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignaRolAPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
