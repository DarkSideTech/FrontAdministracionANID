import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideToastr } from 'ngx-toastr';

import { ValidaEnrrolamientoComponent } from './valida-enrrolamiento.component';

describe('ValidaEnrrolamientoComponent', () => {
  let component: ValidaEnrrolamientoComponent;
  let fixture: ComponentFixture<ValidaEnrrolamientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidaEnrrolamientoComponent],
      providers: [provideAnimationsAsync(), provideToastr()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidaEnrrolamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
