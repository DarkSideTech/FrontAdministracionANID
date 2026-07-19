import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { TranslateModule } from '@ngx-translate/core';
import { provideToastr } from 'ngx-toastr';
import { HeaderComponent } from './header.component';
describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [HeaderComponent, TranslateModule.forRoot()],
    providers: [importProvidersFrom(FeatherModule.pick(allIcons)), provideAnimationsAsync(), provideToastr(), provideRouter([])],
}).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
