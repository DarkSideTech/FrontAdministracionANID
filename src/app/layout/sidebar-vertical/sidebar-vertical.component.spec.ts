import { ComponentFixture, TestBed } from '@angular/core/testing';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';

import { SidebarVerticalComponent } from './sidebar-vertical.component';

describe('SidebarVerticalComponent', () => {
  let component: SidebarVerticalComponent;
  let fixture: ComponentFixture<SidebarVerticalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarVerticalComponent, TranslateModule.forRoot()],
      providers: [importProvidersFrom(FeatherModule.pick(allIcons)), provideRouter([])],
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
