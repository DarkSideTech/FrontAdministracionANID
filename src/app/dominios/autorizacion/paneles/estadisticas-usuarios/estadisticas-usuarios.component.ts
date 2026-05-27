import { Component, HostListener, ViewChild } from '@angular/core';
import { EChartsOption } from 'echarts';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { Color, ScaleType, BarChartModule } from '@swimlane/ngx-charts';
import { LegendPosition } from '@swimlane/ngx-charts';
import { RouterLink } from '@angular/router';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';

@Component({
    selector: 'app-estadisticas-usuarios',
    imports: [
        RouterLink,
        NgxEchartsDirective,
        BarChartModule,
        NgxDatatableModule
    ],
    providers: [
        provideEcharts(),
    ],
    templateUrl: './estadisticas-usuarios.component.html',
    styleUrl: './estadisticas-usuarios.component.scss'
})
export class EstadisticasUsuariosComponent {
  //Bar Chart
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  showYAxisLabel = true;
  public legendPosition: LegendPosition = LegendPosition.Right;
  timeline = true;
  colorScheme: Color = {
    domain: ['#575B7A', '#DE725C', '#DFC126', '#72BE81', '#50A5D8', '#DFA5D8'],
    group: ScaleType.Ordinal,
    selectable: true,
    name: 'Customer Usage',
  };
  showLabels = true;

  vbarxAxisLabel = 'Estado Presupuestario';
  vbaryAxisLabel = 'Monto en Millones';

  // data goes here
  public single = [
    {
      name: 'Presupuesto',
      value: 1600,
    },
    {
      name: 'Pre-Afectado',
      value: 1300,
    },
    {
      name: 'Afectado',
      value: 900,
    },
    {
      name: 'Comprometido',
      value: 700,
    },
    {
      name: 'Devengado',
      value: 400,
    },
    {
      name: 'Pagado',
      value: 200,
    },
  ];

  /* Pie Chart */
  pie_chart: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} m ({d}%)',
    },
    legend: {
      data: ['Disponible', 'Pre-Afectado', 'Afectado', 'Comprometido', 'Devengado', 'Pagado'],
      textStyle: {
        color: '#9aa0ac',
        padding: [0, 4, 0, 4],
      },
    },

    series: [
      {
        name: 'Datos del Gráfico',
        type: 'pie',
        radius: '70%',
        center: ['50%', '55%'],
        data: [
          {
            value: 300,
            name: 'Disponible',
          },
          {
            value: 400,
            name: 'Pre-Afectado',
          },
          {
            value: 200,
            name: 'Afectado',
          },
          {
            value: 300,
            name: 'Comprometido',
          },
          {
            value: 200,
            name: 'Devengado',
          },
          {
            value: 200,
            name: 'Pagado',
          },
        ],
      },
    ],
    color: ['#575B7A', '#DE725C', '#DFC126', '#72BE81', '#50A5D8', '#DFA5D8'],
  };

  //Data Table
  rows = [];
  loadingIndicator = true;
  reorderable = true;
  scrollBarHorizontal = window.innerWidth < 1200;

  @ViewChild('table') table!: DatatableComponent;

  lineaPresupuestaria: string = "2024LP001 Inversion Educacion";

  lane_pie_chart: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} m ({d}%)',
    },
    legend: {
      data: ['Disponible', 'Pre-Afectado', 'Afectado', 'Comprometido', 'Devengado', 'Pagado'],
      textStyle: {
        color: '#9aa0ac',
        padding: [0, 5, 0, 5],
      },
    },

    series: [
      {
        name: 'Datos del Gráfico',
        type: 'pie',
        radius: '50%',
        center: ['50%', '55%'],
        data: [
          {
            value: 150,
            name: 'Disponible',
          },
          {
            value: 10,
            name: 'Pre-Afectado',
          },
          {
            value: 10,
            name: 'Afectado',
          },
          {
            value: 10,
            name: 'Comprometido',
          },
          {
            value: 10,
            name: 'Devengado',
          },
          {
            value: 10,
            name: 'Pagado',
          },
        ],
      },
    ],
    color: ['#575B7A', '#DE725C', '#DFC126', '#72BE81', '#50A5D8', '#DFA5D8'],
  };


  constructor() {
    this.fetch((data: any) => {
      this.rows = data;
      setTimeout(() => {
        this.loadingIndicator = false;
      }, 500);
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.scrollBarHorizontal = window.innerWidth < 1200;
    this.table.recalculate();
    this.table.recalculateColumns();
  }

  getRowHeight(row: any) {
    return row.height;
  }

  fetch(cb: any) {
    const req = new XMLHttpRequest();
    req.open('GET', `assets/data/datatable-data.json`);

    req.onload = () => {
      cb(JSON.parse(req.response));
    };

    req.send();
  }

  graphRow(row: any, rowIndex: number) {
    this.lineaPresupuestaria = row.codigo + " " + row.nombre;

    switch (rowIndex) {
      case 0:
        this.lane_pie_chart = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} m ({d}%)',
          },
          legend: {
            data: ['Disponible', 'Pre-Afectado', 'Afectado', 'Comprometido', 'Devengado', 'Pagado'],
            textStyle: {
              color: '#9aa0ac',
              padding: [0, 5, 0, 5],
            },
          },

          series: [
            {
              name: 'Datos del Gráfico',
              type: 'pie',
              radius: '50%',
              center: ['50%', '55%'],
              data: [
                {
                  value: 150,
                  name: 'Disponible',
                },
                {
                  value: 10,
                  name: 'Pre-Afectado',
                },
                {
                  value: 10,
                  name: 'Afectado',
                },
                {
                  value: 10,
                  name: 'Comprometido',
                },
                {
                  value: 10,
                  name: 'Devengado',
                },
                {
                  value: 10,
                  name: 'Pagado',
                },
              ],
            },
          ],
          color: ['#575B7A', '#DE725C', '#DFC126', '#72BE81', '#50A5D8', '#DFA5D8'],
        };
        break;
      case 1:
        this.lane_pie_chart = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} m ({d}%)',
          },
          legend: {
            data: ['Disponible', 'Pre-Afectado', 'Afectado', 'Comprometido', 'Devengado', 'Pagado'],
            textStyle: {
              color: '#9aa0ac',
              padding: [0, 5, 0, 5],
            },
          },

          series: [
            {
              name: 'Datos del Gráfico',
              type: 'pie',
              radius: '50%',
              center: ['50%', '55%'],
              data: [
                {
                  value: 40,
                  name: 'Disponible',
                },
                {
                  value: 80,
                  name: 'Pre-Afectado',
                },
                {
                  value: 40,
                  name: 'Afectado',
                },
                {
                  value: 60,
                  name: 'Comprometido',
                },
                {
                  value: 40,
                  name: 'Devengado',
                },
                {
                  value: 40,
                  name: 'Pagado',
                },
              ],
            },
          ],
          color: ['#575B7A', '#DE725C', '#DFC126', '#72BE81', '#50A5D8', '#DFA5D8'],
        };
        break;
      case 2:
        this.lane_pie_chart = {
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} m ({d}%)',
          },
          legend: {
            data: ['Disponible', 'Pre-Afectado', 'Afectado', 'Comprometido', 'Devengado', 'Pagado'],
            textStyle: {
              color: '#9aa0ac',
              padding: [0, 5, 0, 5],
            },
          },

          series: [
            {
              name: 'Datos del Gráfico',
              type: 'pie',
              radius: '50%',
              center: ['50%', '55%'],
              data: [
                {
                  value: 80,
                  name: 'Disponible',
                },
                {
                  value: 10,
                  name: 'Pre-Afectado',
                },
                {
                  value: 110,
                  name: 'Afectado',
                },
                {
                  value: 20,
                  name: 'Comprometido',
                },
                {
                  value: 130,
                  name: 'Devengado',
                },
                {
                  value: 250,
                  name: 'Pagado',
                },
              ],
            },
          ],
          color: ['#575B7A', '#DE725C', '#DFC126', '#72BE81', '#50A5D8', '#DFA5D8'],
        };
        break;
    }
  }
}
