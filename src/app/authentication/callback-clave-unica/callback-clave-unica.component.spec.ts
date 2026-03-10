import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallbackClaveUnicaComponent } from './callback-clave-unica.component';

describe('CallbackClaveUnicaComponent', () => {
  let component: CallbackClaveUnicaComponent;
  let fixture: ComponentFixture<CallbackClaveUnicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallbackClaveUnicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallbackClaveUnicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
