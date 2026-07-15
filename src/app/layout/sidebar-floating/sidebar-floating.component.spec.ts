import { ComponentFixture, TestBed } from '@angular/core/testing';
import { importProvidersFrom } from '@angular/core';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';

import { SidebarFloatingComponent } from './sidebar-floating.component';

describe('SidebarFloatingComponent', () => {
  let component: SidebarFloatingComponent;
  let fixture: ComponentFixture<SidebarFloatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarFloatingComponent],
      providers: [importProvidersFrom(FeatherModule.pick(allIcons))],
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
