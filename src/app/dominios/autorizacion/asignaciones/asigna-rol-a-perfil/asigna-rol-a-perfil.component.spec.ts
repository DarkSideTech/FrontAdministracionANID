import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideToastr } from 'ngx-toastr';

import { AsignaRolAPerfilComponent } from './asigna-rol-a-perfil.component';

describe('AsignaRolAPerfilComponent', () => {
  let component: AsignaRolAPerfilComponent;
  let fixture: ComponentFixture<AsignaRolAPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignaRolAPerfilComponent],
      providers: [provideAnimationsAsync(), provideToastr()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignaRolAPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
