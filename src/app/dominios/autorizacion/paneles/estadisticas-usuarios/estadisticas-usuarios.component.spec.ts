import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { EstadisticasUsuariosComponent } from './estadisticas-usuarios.component';

describe('EstadisticasUsuariosComponent', () => {
  let component: EstadisticasUsuariosComponent;
  let fixture: ComponentFixture<EstadisticasUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadisticasUsuariosComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadisticasUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
