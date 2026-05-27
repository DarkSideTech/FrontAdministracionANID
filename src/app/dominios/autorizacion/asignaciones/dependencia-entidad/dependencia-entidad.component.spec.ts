import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DependenciaEntidadComponent } from './dependencia-entidad.component';

describe('DependenciaEntidadComponent', () => {
  let component: DependenciaEntidadComponent;
  let fixture: ComponentFixture<DependenciaEntidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DependenciaEntidadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DependenciaEntidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
