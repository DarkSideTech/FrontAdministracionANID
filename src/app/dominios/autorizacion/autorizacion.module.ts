import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsignacionesModule } from './asignaciones/asignaciones.module';
import { PanelesModule } from 'app/paneles/paneles.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AsignacionesModule,
    PanelesModule,
  ]
})
export class AutorizacionModule { }
