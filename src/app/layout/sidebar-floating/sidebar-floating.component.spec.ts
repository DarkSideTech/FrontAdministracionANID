import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarFloatingComponent } from './sidebar-floating.component';

describe('SidebarFloatingComponent', () => {
  let component: SidebarFloatingComponent;
  let fixture: ComponentFixture<SidebarFloatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarFloatingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarFloatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
