import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';

// Services
import { ConfirmationService, MessageService } from 'primeng/api';

// Interfaces

// Pipes
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

// Animations
import { pageEnterAnimation } from '../../shared/animations';

// Icon field
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-observability',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    CardModule,
    TagModule,
    SkeletonModule,
    TranslatePipe,
    IconFieldModule,
    InputIconModule,
    ChartModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './observability.component.html',
  styleUrl: './observability.component.scss',
  animations: [pageEnterAnimation]
})
export class ObservabilityComponent implements OnInit {

  totalHoras: number = 858;

  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  displayDialogInfo = false;

  docsProcessados = [
    { 
      label: 'observability.rg', 
      count: 120, 
      icon: 'pi pi-id-card', 
      color1: '#4ade80', 
      color2: '#22c55e',
      status: { aprovado: 95, reprovado: 15, pendente: 10 }
    },
    { 
      label: 'observability.cpf', 
      count: 98, 
      icon: 'pi pi-user', 
      color1: '#60a5fa', 
      color2: '#3b82f6',
      status: { aprovado: 88, reprovado: 5, pendente: 5 }
    },
    { 
      label: 'observability.carteiraTrabalho', 
      count: 110, 
      icon: 'pi pi-briefcase', 
      color1: '#fbbf24', 
      color2: '#f59e0b',
      status: { aprovado: 92, reprovado: 12, pendente: 6 }
    },
    { 
      label: 'observability.comprovanteEndereco', 
      count: 105, 
      icon: 'pi pi-map-marker', 
      color1: '#a78bfa', 
      color2: '#8b5cf6',
      status: { aprovado: 87, reprovado: 10, pendente: 8 }
    }
  ];
  economiaDeTempoDocs: any[] = [];

  // KPIs de contratações e performance
  kpisContratacao = [
    {
      label: 'observability.contratacoesMes',
      value: 45,
      icon: 'pi pi-users',
      color1: '#10b981',
      color2: '#059669',
      unit: 'contratações'
    },
    {
      label: 'observability.horasEconomizadas',
      value: 858.9,
      icon: 'pi pi-clock',
      color1: '#8b5cf6',
      color2: '#7c3aed',
      unit: 'horas'
    },
    {
      label: 'observability.eficienciaProcesso',
      value: 92.5,
      icon: 'pi pi-chart-line',
      color1: '#f59e0b',
      color2: '#d97706',
      unit: '%'
    },
    {
      label: 'observability.tempoMedioProcessamento',
      value: 24,
      icon: 'pi pi-stopwatch',
      color1: '#ef4444',
      color2: '#dc2626',
      unit: 'horas'
    },
    {
      label: 'observability.documentosProcessados',
      value: 433,
      icon: 'pi pi-file-check',
      color1: '#06b6d4',
      color2: '#0891b2',
      unit: 'docs'
    },
    {
      label: 'observability.taxaAprovacao',
      value: 89.2,
      icon: 'pi pi-check-circle',
      color1: '#22c55e',
      color2: '#16a34a',
      unit: '%'
    }
  ];

  acuraciaDocs = [
    { label: 'observability.rg', value: 95, color1: '#4ade80', color2: '#22c55e', icon: 'pi pi-id-card' },
    { label: 'observability.cpf', value: 98, color1: '#60a5fa', color2: '#3b82f6', icon: 'pi pi-user' },
    { label: 'observability.carteiraTrabalho', value: 92, color1: '#fbbf24', color2: '#f59e0b', icon: 'pi pi-briefcase' },
    { label: 'observability.comprovanteEndereco', value: 94, color1: '#a78bfa', color2: '#8b5cf6', icon: 'pi pi-map-marker' }
  ];


  data: any;

  options: any;

  platformId = inject(PLATFORM_ID);

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
  this.initChart();
  this.calculateTimeSaved();
  this.totalHoras = 0;
  }

  calculateTimeSaved() {
    const humanTimePerDoc = 2 * 60; // 2 hours in minutes
    const systemTimePerDoc = 1; // 1 minute
    const timeSavedPerDoc = humanTimePerDoc - systemTimePerDoc;

    this.economiaDeTempoDocs = this.docsProcessados.map(doc => {
      const totalTimeSaved = doc.count * timeSavedPerDoc;
      return {
        ...doc,
        value: totalTimeSaved,
        unit: 'min'
      };
    });
    // Soma total das horas economizadas
    this.totalHoras = this.economiaDeTempoDocs.reduce((acc, doc) => acc + doc.value, 0) / 60;
  }

  initChart() {
    if ((this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
      const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

      // Preparar dados agrupados por tipo de documento e status
      const labels = this.docsProcessados.map(doc => {
        switch(doc.label) {
          case 'observability.rg': return 'RG';
          case 'observability.cpf': return 'CPF';
          case 'observability.carteiraTrabalho': return 'Carteira de Trabalho';
          case 'observability.comprovanteEndereco': return 'Comprovante de Endereço';
          default: return doc.label;
        }
      });

      this.data = {
        labels: labels,
        datasets: [
          {
            label: 'Aprovado',
            backgroundColor: '#22c55e',
            borderColor: '#16a34a',
            borderWidth: 1,
            data: this.docsProcessados.map(doc => doc.status.aprovado)
          },
          {
            label: 'Reprovado',
            backgroundColor: '#ef4444',
            borderColor: '#dc2626',
            borderWidth: 1,
            data: this.docsProcessados.map(doc => doc.status.reprovado)
          },
          {
            label: 'Pendente',
            backgroundColor: '#f59e0b',
            borderColor: '#d97706',
            borderWidth: 1,
            data: this.docsProcessados.map(doc => doc.status.pendente)
          }
        ]
      };

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: textColor,
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12,
                weight: '500'
              }
            }
          },
          title: {
            display: true,
            text: 'Status dos Documentos por Tipo',
            color: textColor,
            font: {
              size: 16,
              weight: '600'
            },
            padding: {
              top: 10,
              bottom: 30
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: surfaceBorder,
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function(context: any) {
                return context.dataset.label + ': ' + context.parsed.y + ' documentos';
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
              font: {
                weight: '500',
                size: 11
              },
              maxRotation: 45,
              minRotation: 0
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false,
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: textColorSecondary,
              font: {
                size: 11
              },
              callback: function(value: any) {
                return value + ' docs';
              }
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      };
      this.cd.markForCheck()
    }
  }

}