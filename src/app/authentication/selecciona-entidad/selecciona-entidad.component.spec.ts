import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionaEntidadComponent } from './selecciona-entidad.component';

describe('SeleccionaEntidadComponent', () => {
  let component: SeleccionaEntidadComponent;
  let fixture: ComponentFixture<SeleccionaEntidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionaEntidadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionaEntidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
