import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { DependenciaEntidadComponent } from './dependencia-entidad.component';

describe('DependenciaEntidadComponent', () => {
  let component: DependenciaEntidadComponent;
  let fixture: ComponentFixture<DependenciaEntidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DependenciaEntidadComponent],
      providers: [provideAnimationsAsync(), provideToastr(), provideRouter([])],
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
