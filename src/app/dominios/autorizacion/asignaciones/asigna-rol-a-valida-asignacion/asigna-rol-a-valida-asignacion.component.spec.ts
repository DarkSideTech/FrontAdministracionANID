import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignaRolAValidaAsignacionComponent } from './asigna-rol-a-valida-asignacion.component';

describe('AsignaRolAValidaAsignacionComponent', () => {
  let component: AsignaRolAValidaAsignacionComponent;
  let fixture: ComponentFixture<AsignaRolAValidaAsignacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignaRolAValidaAsignacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignaRolAValidaAsignacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
