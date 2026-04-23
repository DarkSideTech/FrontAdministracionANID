import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AccountAuthService } from '@core/auth/account-auth.service';
import { EnumerationService, SignupCatalogs } from '@core/enumerations/enumeration.service';
import { SignupComponent } from './signup.component';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let accountAuthServiceSpy: jasmine.SpyObj<AccountAuthService>;
  let enumerationServiceSpy: jasmine.SpyObj<EnumerationService>;

  const signupCatalogs: SignupCatalogs = {
    tipoDeUsuario: [{ value: 'EXTRANJERO', label: 'Extranjero' }],
    nacionalidades: [{ value: 'Chileno_a', label: 'Chileno/a' }],
    documentosDeIdentidad: [{ value: 'PASAPORTE', label: 'Pasaporte' }],
    sexoDeclarativo: [{ value: 'FEMENINO', label: 'Femenino' }],
    sexoRegistral: [{ value: 'FEMENINO', label: 'Femenino' }],
  };

  beforeEach(async () => {
    accountAuthServiceSpy = jasmine.createSpyObj<AccountAuthService>('AccountAuthService', [
      'ensureCsrfToken',
      'register',
    ]);
    enumerationServiceSpy = jasmine.createSpyObj<EnumerationService>('EnumerationService', [
      'loadSignupCatalogs',
    ]);

    accountAuthServiceSpy.ensureCsrfToken.and.returnValue(of(void 0));
    accountAuthServiceSpy.register.and.returnValue(of({ Message: 'ok' }));
    enumerationServiceSpy.loadSignupCatalogs.and.returnValue(of(signupCatalogs));

    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [
        provideRouter([]),
        { provide: AccountAuthService, useValue: accountAuthServiceSpy },
        { provide: EnumerationService, useValue: enumerationServiceSpy },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
