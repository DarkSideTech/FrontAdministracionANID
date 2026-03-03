import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-forgot',
    templateUrl: './forgot.component.html',
    styleUrls: ['./forgot.component.sass'],
    imports: [FormsModule, RouterLink]
})
export class ForgotComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
