import { Component, OnInit, ViewChild, } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatatableComponent, SelectionType, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from 'uuid';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-asigna-perfil-a-valida-enrrolamiento',
  standalone: true,
  imports: [
    RouterLink,
    NgxDatatableModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule,
    TranslateModule
  ],
  templateUrl: './asigna-perfil-a-valida-enrrolamiento.component.html',
  styleUrl: './asigna-perfil-a-valida-enrrolamiento.component.scss'
})
export class AsignaPerfilAValidaEnrrolamientoComponent implements OnInit  {

  @ViewChild(DatatableComponent, { static: false }) table!: DatatableComponent;

  isPerfilSelected = false;
  public perfilSelected: number[] = [];
  perfilColumns = [
    { name: 'Id' },
    { name: 'Codigo' },
    { name: 'Nombre' },
    { name: 'Descripcion' },    
    { name: 'Activo' },
  ];
  perfilRows = [];
  perfilData: any[] = [];
  perfilFilteredData: any[] = [];
  perfilRegister!: UntypedFormGroup;

  isRolSelected = false;
  public rolSelected: number[] = [];
  rolColumns = [
    { name: 'Id' },
    { name: 'Codigo' },
    { name: 'Nombre' },
    { name: 'Descripcion' },    
    { name: 'Activo' },

  ];
  rolRows = [];
  rolData: any[] = [];
  rolFilteredData: any[] = [];
  rolRegister!: UntypedFormGroup;

  scrollBarHorizontal = window.innerWidth < 1200;
  selectedRowData!: selectRowInterface;
  editForm: UntypedFormGroup;
  loadingIndicator = true;
  selectedOption!: string;
  reorderable = true;
  
  booleanoType = [
    { id: '1', value: true },
    { id: '2', value: false },
  ];
    
  selection!: SelectionType;
  constructor(
    private fb: UntypedFormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService
  ) {
    this.editForm = this.fb.group({
      id: new UntypedFormControl(),
      codigo: new UntypedFormControl(),
      nombre: new UntypedFormControl(),
      descripcion: new UntypedFormControl(),
      activo: new UntypedFormControl(),
    });
    window.onresize = () => {
      this.scrollBarHorizontal = window.innerWidth < 1200;
    };
    this.selection = SelectionType.checkbox;
  }

  // select record using check box
  onPerfilSelect({ selected }: { selected: any }) {
    this.perfilSelected.splice(0, this.perfilSelected.length);
    this.perfilSelected.push(...selected);

    if (this.perfilSelected.length === 0) {
      this.isPerfilSelected = false;
    } else {
      this.isPerfilSelected = true;
    }
  }

  onRolSelect({ selected }: { selected: any }) {
    this.rolSelected.splice(0, this.rolSelected.length);
    this.rolSelected.push(...selected);

    if (this.rolSelected.length === 0) {
      this.isRolSelected = false;
    } else {
      this.isRolSelected = true;
    }
  }

  asignacionMasivaDeRolesSeleccionados() {
    Swal.fire({
      title: '<p class="swal2-title-custom">Confirmación de cambio</p>',
      html: '<p class="swal2-subtitle">¿Está seguro que desea realizar los cambios? Recuerda que puedes volver a modificar de ser necesario.</p>',
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    customClass: {
      popup: 'swal2-custom-popup',
      confirmButton: 'btn-confirm-border',
      cancelButton: 'btn-cancel',
    },
    buttonsStyling: false,
    }).then((result) => {
      if (result.value) {
        this.asignacionMasivaDeRolesSuccess();
      }
    });
  }

  asignacionMasivaDePefilesSeleccionados() {
    Swal.fire({
      title: 'Esta seguro?',
      showCancelButton: true,
      confirmButtonColor: '#8963ff',
      cancelButtonColor: '#fb7823',
      confirmButtonText: 'Yes',
    }).then((result) => {
      if (result.value) {
        this.asignacionMasivaDePerfilesSuccess();
      }
    });
  }

  ngOnInit() {
    this.perfilFetch((data: any) => {
      this.perfilData = data;
      this.perfilFilteredData = data;
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 500);
    });
    this.rolFetch((data: any) => {
      this.rolData = data;
      this.rolFilteredData = data;
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 500);
    });
    this.perfilRegister = this.fb.group({
      id: [''],
      codigo: [''],
      nombre: [''],
      descripcion: [''],
      activo: [''],
    });
    this.rolRegister = this.fb.group({
      id: [''],
      codigo: [''],
      nombre: [''],
      descripcion: [''],
      activo: [''],
    });
  }

  perfilFetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', 'assets/data/perfiles-tbl-data.json');
    req.onload = () => {
      const data = JSON.parse(req.response);
      cb(data);
    };
    req.send();
  }

  rolFetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', 'assets/data/perfiles-tbl-data.json');
    req.onload = () => {
      const data = JSON.parse(req.response);
      cb(data);
    };
    req.send();
  }

  activarRow(row: any) {
    row.activo=true;
    this.selectedRowData = row;
    this.activateRecordSuccess();
  }

  desactivarRow(row: any) {
    row.activo=false;
    this.selectedRowData = row;
    this.desactivateRecordSuccess();
  }

  // filter table data
  perfilFilterDatatable(event: any) {
    // get the value of the key pressed and make it lowercase
    const val = event.target.value.toLowerCase();
    // get the amount of columns in the table
    const colsAmt = this.perfilColumns.length;

    // get the key names of each column in the dataset
    const keys = Object.keys(this.perfilFilteredData[0]);
    // assign filtered matches to the active datatable

    this.perfilData = this.perfilFilteredData.filter((item) => {
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

  rolFilterDatatable(event: any) {
    // get the value of the key pressed and make it lowercase
    const val = event.target.value.toLowerCase();
    // get the amount of columns in the table
    const colsAmt = this.rolColumns.length;

    // get the key names of each column in the dataset
    const keys = Object.keys(this.rolFilteredData[0]);
    // assign filtered matches to the active datatable

    this.rolData = this.rolFilteredData.filter((item) => {
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

  toggleExpandRow(row) {
    console.log('Alternar expandir fila!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }

  onPerfilDetailToggle(event) {
    console.log('Detalle alternado', event);
  }

  onRolDetailToggle(event) {
    console.log('Detalle alternado', event);
  }

  // get random id
  getId(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  getUUID() {
    return uuidv4();
  }
  getDateNow() {
    return Date.now();
  }
  addRecordSuccess() {
    this.toastr.success('Se agrego registro correctamente', '');
  }
  activateRecordSuccess() {
    this.toastr.success('Se Activo el Perfil correctamente', '');
  }
  desactivateRecordSuccess() {
    this.toastr.success('Se Desactivo el Perfil correctamente', '');
  }
  editRecordSuccess() {
    this.toastr.success('Se modifico registro correctamente', '');
  }

  asignacionMasivaDeRolesSuccess() {
    this.toastr.success('Se asignaron los roles correctamente', '');
  }

  asignacionMasivaDePerfilesSuccess() {
    this.toastr.success('Se asignaron los perfiless correctamente', '');
  }

  eliminacionMasivaDeRolesSuccess() {
    this.toastr.success('Se eliminaron los perfiles correctamente', '');
  }

  eliminacionMasivaDePerfilesSuccess() {
    this.toastr.success('Se asignaron los perfiless correctamente', '');
  }

  deleteRecordSuccess(count: number) {
    this.toastr.error(count + ' registros eliminados correctamente', '');
  }

  hiddenAsignacionMasiva() {
    return this.isPerfilSelected && this.isRolSelected
  }

}
export interface selectRowInterface {
  id: string;
}