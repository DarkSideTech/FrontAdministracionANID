import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidaEnrrolamientoComponent } from './valida-enrrolamiento.component';

describe('ValidaEnrrolamientoComponent', () => {
  let component: ValidaEnrrolamientoComponent;
  let fixture: ComponentFixture<ValidaEnrrolamientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidaEnrrolamientoComponent]
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
