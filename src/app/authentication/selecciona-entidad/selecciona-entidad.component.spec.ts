import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';

import { SeleccionaEntidadComponent } from './selecciona-entidad.component';
import { AccountAuthService } from '@core/auth/account-auth.service';
import { AuthStore } from '@core/auth/auth-store.service';

describe('SeleccionaEntidadComponent', () => {
  let component: SeleccionaEntidadComponent;
  let fixture: ComponentFixture<SeleccionaEntidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionaEntidadComponent],
      providers: [
        {
          provide: AccountAuthService,
          useValue: {
            loginOrganizacion: () => of({}),
            logout: () => of(void 0),
            resolveAuthenticatedUrl: () => '/paneles/estadisticas-usuarios',
          },
        },
        {
          provide: AuthStore,
          useValue: {
            organizations: () => [],
          },
        },
        {
          provide: Router,
          useValue: {
            navigateByUrl: jasmine.createSpy('navigateByUrl'),
          },
        },
      ],
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
