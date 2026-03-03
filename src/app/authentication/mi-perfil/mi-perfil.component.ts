import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbNav, NgbNavContent, NgbNavItem, NgbNavItemRole, NgbNavLink, NgbNavLinkBase, NgbNavModule, NgbNavOutlet } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-mi-perfil',
    //standalone: true,
    imports: [
        RouterLink,
        NgbNav,
        NgbNavItem,
        NgbNavItemRole,
        NgbNavLinkBase,
        NgbNavLink,
        NgbNavContent,
        NgbNavOutlet,
        NgbNavModule,
    ],
    templateUrl: './mi-perfil.component.html',
    styleUrl: './mi-perfil.component.scss'
})
export class MiPerfilComponent {
  active!: number;
  constructor() {
    //constructor
  }

}
