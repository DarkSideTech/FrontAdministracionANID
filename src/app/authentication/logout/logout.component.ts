import { Component } from '@angular/core';
import { AuthService } from '@core/service/auth.service';

@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss',
})
export class LogoutComponent {
  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.logout();
  }
}
