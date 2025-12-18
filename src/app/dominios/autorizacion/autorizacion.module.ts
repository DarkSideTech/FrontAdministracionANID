import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntidadesModule } from './entidades/entidades.module';
import { AsignacionesModule } from './asignaciones/asignaciones.module';
import { PanelesModule } from 'app/paneles/paneles.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    EntidadesModule,
    AsignacionesModule,
    PanelesModule,
  ]
})
export class AutorizacionModule { }
