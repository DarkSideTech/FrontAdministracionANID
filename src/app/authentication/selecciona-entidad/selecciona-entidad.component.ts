import { Component, OnInit, ViewChild, } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatatableComponent, SelectionType, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { ServicioDeDominioService } from '@core/service/controllers/servicio-de-dominio.service';
import { AuthService } from '@core/service/auth.service';
import { OrganizacionPorUsuario } from '@core/models/servicioDeDominioController';
import { LoginOrganizacion } from '@core/models/accountController';

@Component({
  selector: 'app-selecciona-entidad',
  standalone: true,
  imports: [
    RouterLink,
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
    private authService: AuthService,
    private servicioDeDominio: ServicioDeDominioService
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

  // select record using check box
  onSelect({ selected }: { selected: any }) {
    // Detectar si estamos en la tabla asign_material
    const esAsignMaterial = true; // como esta función solo se llama desde esa tabla, lo asumimos

    if (esAsignMaterial) {
      // Solo permitir un checkbox marcado
      this.selected = selected.length ? [selected[selected.length - 1]] : [];
    } else {
      // Lógica normal para otras tablas
      this.selected.splice(0, this.selected.length);
      this.selected.push(...selected);
    }

    // Actualizar bandera
    this.isRowSelected = this.selected.length > 0;
  }

  ngOnInit() {
    console.log('checkAuthStatus en selecciona-entidad:', this.authService.checkAuthStatus());
    // this.authService.checkAuthStatus().subscribe({
    //   next: (response) => {
    //     // Maneja el resultado exitoso
    //     this.data = response;
    //     console.log('Datos recibidos:', response);
    //     //this.fetch();
    //   },
    //   error: (err) => {
    //     // Maneja errores
    //     //this.error = 'Error al cargar los datos: ' + err.message;
    //     console.error('Error en la llamada:', err);
    //   },
    //   complete: () => {
    //     // Se ejecuta cuando la suscripción se completa (opcional)
    //     console.log('Llamada al servicio completada.');
    //   }
    // });
    this.fetch();
    this.seleccionaEntidadForm = this.fb.group({
        codigo_Organizacion: [''],
        nombre_Organizacion: [''],
    });
  }

  onSubmit() {
    console.log('Item Seleccionado:', this.selected);
    //this.router.navigate(['dominios/autorizacion/paneles/estadisticas-usuarios']);
  }

  // fetch data
  fetch() {
    this.servicioDeDominio
      .buscarOrganizacionesPor_Id_Usuario(this.authService.currentUserValue.Id).subscribe(datos => {
        this.data = datos;
        this.filteredData = datos;
        setTimeout(() => {
          this.loadingIndicator = false;
        }, 500);
        console.log('Resultado de buscarrDatos dentro de fetch:', datos); 

        if(this.data.length === 1){
          this.loginOrganizacion.organizacion = this.data[0].codigo_Organizacion;
          // this.authService
          //   .loginOrganizacion(this.loginOrganizacion);
        }

      });
  }

  // filter table data
  filterDatatable(event: any) {
    // get the value of the key pressed and make it lowercase
    const val = event.target.value.toLowerCase();
    // get the amount of columns in the table
    const colsAmt = this.columns.length;
    // get the key names of each column in the dataset
    const keys = Object.keys(this.filteredData[0]);
    // assign filtered matches to the active datatable

    this.data = this.filteredData.filter((item) => {
      // iterate through each row's column data
      for (let i = 0; i < colsAmt; i++) {
        // check for a match
        if (
          item[keys[i]].toString().toLowerCase().indexOf(val) !== -1 ||
          !val
        ) {
          // found match, return true to add to result set
          return true;
        }
      }
      return false;
    });
    // whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }
}

export interface selectRowInterface {
  id: string;
}
