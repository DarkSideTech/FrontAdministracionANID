import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AccountAuthService } from '@core/auth/account-auth.service';
import { EnumerationService } from '@core/enumerations/enumeration.service';
import { MiPerfilComponent } from './mi-perfil.component';

describe('MiPerfilComponent', () => {
  let component: MiPerfilComponent;
  let fixture: ComponentFixture<MiPerfilComponent>;
  let accountAuthServiceSpy: jasmine.SpyObj<AccountAuthService>;
  let enumerationServiceSpy: jasmine.SpyObj<EnumerationService>;

  beforeEach(async () => {
    accountAuthServiceSpy = jasmine.createSpyObj<AccountAuthService>('AccountAuthService', [
      'ensureCsrfToken',
      'loadMyInformation',
      'modificaUsuario',
      'modificaCorreoElectronico',
    ]);
    enumerationServiceSpy = jasmine.createSpyObj<EnumerationService>('EnumerationService', [
      'loadProfileCatalogs',
    ]);

    accountAuthServiceSpy.ensureCsrfToken.and.returnValue(of(void 0));
    accountAuthServiceSpy.loadMyInformation.and.returnValue(of({
      isAuthenticated: true,
      accessTokenExpiration: null,
      user: {
        id: 'user-1',
        email: 'user@example.com',
        nombreADesplegar: 'Usuario Demo',
        tipoDeUsuario: 'EXTRANJERO',
        nacionalidad: 'Chileno_a',
        documentoDeIdentidad: 'PASAPORTE',
        numeroDeDocumento: '12345678',
        codigoValidadorDocumento: '9',
        primerNombre: 'Usuario',
        segundoNombre: 'Demo',
        primerApellido: 'Example',
        segundoApellido: 'Apellido',
        sexoDeclarativo: 'MUJER',
        sexoRegistral: 'FEMENINO',
        fechaDeNacimiento: '1990-01-01',
      },
      sessionKind: 'LOGIN_ORGANIZATION',
      organizations: [],
      organizationalUnits: [],
      activeProcesses: [],
      selectedOrganizationCode: null,
      selectedOrganizationName: null,
      selectedUnitCode: null,
      selectedUnitName: null,
      selectedEntityId: null,
      selectedEntityRole: null,
      organizationSelectionRequired: false,
    }));
    accountAuthServiceSpy.modificaUsuario.and.returnValue(of({ Message: 'ok' }));
    accountAuthServiceSpy.modificaCorreoElectronico.and.returnValue(of({ Email: 'nuevo@example.com', Message: 'ok' }));
    enumerationServiceSpy.loadProfileCatalogs.and.returnValue(of({
      tipoDeUsuario: [
        { value: 'NACIONAL', label: 'Nacional' },
        { value: 'EXTRANJERO', label: 'Extranjero' },
      ],
      nacionalidades: [{ value: 'Chileno_a', label: 'Chileno/a' }],
      documentosDeIdentidad: [{ value: 'PASAPORTE', label: 'Pasaporte' }],
      sexoDeclarativo: [{ value: 'MUJER', label: 'Mujer' }],
      sexoRegistral: [{ value: 'FEMENINO', label: 'Femenino' }],
    }));

    await TestBed.configureTestingModule({
      imports: [MiPerfilComponent],
      providers: [
        provideRouter([]),
        { provide: AccountAuthService, useValue: accountAuthServiceSpy },
        { provide: EnumerationService, useValue: enumerationServiceSpy },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
