import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarVerticalComponent } from './sidebar-vertical.component';

describe('SidebarVerticalComponent', () => {
  let component: SidebarVerticalComponent;
  let fixture: ComponentFixture<SidebarVerticalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarVerticalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarVerticalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
