import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { provideToastr } from 'ngx-toastr';

import { AsignaRolAValidaAsignacionComponent } from './asigna-rol-a-valida-asignacion.component';

describe('AsignaRolAValidaAsignacionComponent', () => {
  let component: AsignaRolAValidaAsignacionComponent;
  let fixture: ComponentFixture<AsignaRolAValidaAsignacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignaRolAValidaAsignacionComponent, TranslateModule.forRoot()],
      providers: [provideAnimationsAsync(), provideToastr(), provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignaRolAValidaAsignacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
