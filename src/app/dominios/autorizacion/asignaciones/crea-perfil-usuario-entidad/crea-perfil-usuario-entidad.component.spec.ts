import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { provideToastr } from 'ngx-toastr';

import { CreaPerfilUsuarioEntidadComponent } from './crea-perfil-usuario-entidad.component';

describe('CreaPerfilUsuarioEntidadComponent', () => {
  let component: CreaPerfilUsuarioEntidadComponent;
  let fixture: ComponentFixture<CreaPerfilUsuarioEntidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreaPerfilUsuarioEntidadComponent, TranslateModule.forRoot()],
      providers: [provideAnimationsAsync(), provideToastr(), provideRouter([])],
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
