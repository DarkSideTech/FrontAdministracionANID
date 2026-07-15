import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';

import { AsignaPerfilAValidaEnrrolamientoComponent } from './asigna-perfil-a-valida-enrrolamiento.component';

describe('AsignaPerfilAValidaEnrrolamientoComponent', () => {
  let component: AsignaPerfilAValidaEnrrolamientoComponent;
  let fixture: ComponentFixture<AsignaPerfilAValidaEnrrolamientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignaPerfilAValidaEnrrolamientoComponent],
      providers: [provideAnimationsAsync(), provideToastr(), provideRouter([])],
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
