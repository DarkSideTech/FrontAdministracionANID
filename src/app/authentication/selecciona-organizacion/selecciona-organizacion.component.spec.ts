import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';

import { SeleccionaOrganizacionComponent } from './selecciona-organizacion.component';
import { AccountAuthService } from '@core/auth/account-auth.service';
import { AuthStore } from '@core/auth/auth-store.service';

describe('SeleccionaOrganizacionComponent', () => {
  let component: SeleccionaOrganizacionComponent;
  let fixture: ComponentFixture<SeleccionaOrganizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeleccionaOrganizacionComponent],
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

    fixture = TestBed.createComponent(SeleccionaOrganizacionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
