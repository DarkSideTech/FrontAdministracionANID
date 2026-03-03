import { Component, inject, OnInit, ViewChild, } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatatableComponent, SelectionType, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrModule } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '@core/service/auth.service';
import { OrganizacionPorUsuario } from '@core/models/servicioDeDominioController';
import { LoginOrganizacion } from '@core/models/accountController';
import { ServiciosDeDominioService } from '@core/service/controllers/servicios-de-dominio.service';

@Component({
    selector: 'app-selecciona-entidad',
    imports: [
        NgxDatatableModule,
        FormsModule,
        ReactiveFormsModule,
        ToastrModule,
        TranslateModule,
    ],
    templateUrl: './selecciona-entidad.component.html',
    styleUrl: './selecciona-entidad.component.scss'
})
export class SeleccionaEntidadComponent implements OnInit  {

  private serviciosDeDominio = inject(ServiciosDeDominioService);

  @ViewChild(DatatableComponent, { static: false }) table!: DatatableComponent;

  seleccionaEntidadForm!: UntypedFormGroup;

  loginOrganizacion: LoginOrganizacion = new LoginOrganizacion();
  rows = [];
  scrollBarHorizontal = window.innerWidth < 1200;
  selectedRowData!: selectRowInterface;
  data: OrganizacionPorUsuario[] = [];
  filteredData: OrganizacionPorUsuario[] = [];
  loadingIndicator = true;
  isRowSelected = false;
  selectedOption!: string;
  reorderable = true;
  public selected: number[] = [];
  columns = [
    { name: 'Codigo_Organizacion' },
    { name: 'Nombre_Organizacion' },
  ];

  selection!: SelectionType;
  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.seleccionaEntidadForm = this.fb.group({
      codigo_Organizacion: new UntypedFormControl(),
      nombre_Organizacion: new UntypedFormControl(),
    });
    window.onresize = () => {
      this.scrollBarHorizontal = window.innerWidth < 1200;
    };
    this.selection = SelectionType.checkbox;
  }

  onSelect({ selected }: { selected: any }) {
    const esAsignMaterial = true;

    if (esAsignMaterial) {
      this.selected = selected.length ? [selected[selected.length - 1]] : [];
    } else {
      this.selected.splice(0, this.selected.length);
      this.selected.push(...selected);
    }

    this.isRowSelected = this.selected.length > 0;
  }

  ngOnInit() {
    console.log('checkAuthStatus en selecciona-entidad:', this.authService.checkAuthStatus());
    this.fetchData();
    this.seleccionaEntidadForm = this.fb.group({
        codigo_Organizacion: [''],
        nombre_Organizacion: [''],
    });
  }

  fetchData() {
    this.serviciosDeDominio.getBuscarOrganizacionesPor_Usuario()
      .subscribe({
        next: (data) => {
          this.data = data;
          if(this.data.length === 1){
            this.loginOrganizacion.organizacion = this.data[0].codigo_Organizacion;
            // this.authService
            //   .loginOrganizacion(this.loginOrganizacion);
          }
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
  }

  onSubmit() {
    this.router.navigate(['dominios/autorizacion/paneles/estadisticas-usuarios']);
  }

  filterDatatable(event: any) {
    const val = event.target.value.toLowerCase();
    const colsAmt = this.columns.length;
    const keys = Object.keys(this.filteredData[0]);

    this.data = this.filteredData.filter((item) => {
      for (let i = 0; i < colsAmt; i++) {
        if (
          item[keys[i]].toString().toLowerCase().indexOf(val) !== -1 ||
          !val
        ) {
          return true;
        }
      }
      return false;
    });
    this.table.offset = 0;
  }
}

export interface selectRowInterface {
  id: string;
}
