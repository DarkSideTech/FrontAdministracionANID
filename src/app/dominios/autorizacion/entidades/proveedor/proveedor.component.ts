import { Component, OnInit, ViewChild, } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatatableComponent, SelectionType, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from 'uuid';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-proveedor',
    imports: [
        RouterLink,
        NgxDatatableModule,
        FormsModule,
        ReactiveFormsModule,
        ToastrModule,
        TranslateModule,
    ],
    templateUrl: './proveedor.component.html',
    styleUrl: './proveedor.component.scss'
})
export class ProveedorComponent implements OnInit  {

  @ViewChild(DatatableComponent, { static: false }) table!: DatatableComponent;

  rows = [];
  scrollBarHorizontal = window.innerWidth < 1200;
  selectedRowData!: selectRowInterface;
  data: any[] = [];
  filteredData: any[] = [];
  editForm: UntypedFormGroup;
  register!: UntypedFormGroup;
  loadingIndicator = true;
  isRowSelected = false;
  selectedOption!: string;
  reorderable = true;
  public selected: number[] = [];
  columns = [
    { name: 'Id' },
    { name: 'Codigo' },
    { name: 'Nombre' },
    { name: 'Descripcion' },    
    { name: 'APIDeAutenticacion' },    
    { name: 'Activo' },
  ];
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
      apiDeAutenticacion: new UntypedFormControl(),
      activo: new UntypedFormControl(),
    });
    window.onresize = () => {
      this.scrollBarHorizontal = window.innerWidth < 1200;
    };
    this.selection = SelectionType.checkbox;
  }

  // select record using check box
  onSelect({ selected }: { selected: any }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);

    if (this.selected.length === 0) {
      this.isRowSelected = false;
    } else {
      this.isRowSelected = true;
    }
  }

  deleteSelected() {
    Swal.fire({
      title: '<p class="swal2-title-custom">¿Seguro que deseas eliminar?</p>',
      html: '<p class="swal2-subtitle">Los elementos se eliminarán de forma permanente,no se puede deshacer.</p>',
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
        this.selected.forEach((row) => {
          this.deleteRecord(row);
        });
        this.deleteRecordSuccess(this.selected.length);
        this.selected = [];
        this.isRowSelected = false;
      }
    });
  }

  ngOnInit() {
    this.fetch((data: any) => {
      this.data = data;
      this.filteredData = data;
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 500);
    });
    this.register = this.fb.group({
      id: [''],
      codigo: [''],
      nombre: [''],
      descripcion: [''],
      apiDeAutenticacion: [''],
      activo: [''],
    });
  }

  // fetch data
  fetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', 'assets/data/proveedores-tbl-data.json');
    req.onload = () => {
      const data = JSON.parse(req.response);
      cb(data);
    };
    req.send();
  }

  // add new record
  addRow(content: any) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
    this.register.patchValue({
      id: this.getUUID(),
      activo: true,
    });
  }

  // edit record
  editRow(row: any, rowIndex: number, content: any) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
    });
    this.editForm.setValue({
      id: row.id,
      codigo: row.codigo,
      nombre: row.nombre,
      descripcion: row.descripcion,
      apiDeAutenticacion: row.apiDeAutenticacion,
      activo: row.activo,
    });
    this.selectedRowData = row;
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

  // delete single row
  deleteSingleRow(row: any) {
    Swal.fire({
      title: '<p class="swal2-title-custom">¿Seguro que deseas eliminar?</p>',
      html: '<p class="swal2-subtitle">Los elementos se eliminarán de forma permanente,no se puede deshacer.</p>',
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
        this.deleteRecord(row);
        this.deleteRecordSuccess(1);
      }
    });
  }

  deleteRecord(row: any) {
    this.data = this.arrayRemove(this.data, row.id);
  }

  arrayRemove(array: any[], id: any) {
    return array.filter(function (element) {
      return element.id !== id;
    });
  }

  // save add new record
  onAddRowSave(form: UntypedFormGroup) {
    this.data.push(form.value);
    this.data = [...this.data];
    form.reset();
    this.modalService.dismissAll();
    this.addRecordSuccess();
  }

  // save record on edit
  onEditSave(form: UntypedFormGroup) {
    this.data = this.data.filter((value, key) => {
      if (value.id == form.value.id) {
        value.codigo == form.value.codigo;
        value.nombre == form.value.nombre;
        value.descripcion == form.value.descripcion;
        value.apiDeAutenticacion == form.value.apiDeAutenticacion;
        value.activo == form.value.activo;
      }
      this.modalService.dismissAll();
      return true;
    });
    this.editRecordSuccess();
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

  toggleExpandRow(row) {
    console.log('Alternar expandir fila!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }

  onDetailToggle(event) {
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
    this.toastr.success('Se Activo el Proveedor correctamente', '');
  }
  desactivateRecordSuccess() {
    this.toastr.success('Se Desactivo el Proveedor correctamente', '');
  }
  editRecordSuccess() {
    this.toastr.success('Se modifico registro correctamente', '');
  }
  deleteRecordSuccess(count: number) {
    this.toastr.error(count + ' registros eliminados correctamente', '');
  }
}
export interface selectRowInterface {
  id: string;
}
