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

  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  displayDialogInfo = false;

  docsProcessados = [
    { label: 'observability.rg', count: 120, icon: 'pi pi-id-card', color1: '#4ade80', color2: '#22c55e' },
    { label: 'observability.cpf', count: 98, icon: 'pi pi-user', color1: '#60a5fa', color2: '#3b82f6' },
    { label: 'observability.carteiraIdentidade', count: 110, icon: 'pi pi-home', color1: '#fbbf24', color2: '#f59e0b' },
    { label: 'observability.comprovanteEndereco', count: 105, icon: 'pi pi-map-marker', color1: '#a78bfa', color2: '#8b5cf6' }
  ];
  economiaDeTempoDocs: any[] = [];

  acuraciaDocs = [
    { label: 'observability.rg', value: 95, color1: '#4ade80', color2: '#22c55e', icon: 'pi pi-id-card' },
    { label: 'observability.cpf', value: 98, color1: '#60a5fa', color2: '#3b82f6', icon: 'pi pi-user' },
    { label: 'observability.comprovanteResidencia', value: 92, color1: '#fbbf24', color2: '#f59e0b', icon: 'pi pi-home' },
    { label: 'observability.comprovanteEndereco', value: 94, color1: '#a78bfa', color2: '#8b5cf6', icon: 'pi pi-map-marker' }
  ];


  data: any;

  options: any;

  platformId = inject(PLATFORM_ID);

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.initChart();
    this.calculateTimeSaved();
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
  }

  initChart() {
    if ((this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
      const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

      this.data = {
        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
        datasets: [
          {
            label: 'RG',
            backgroundColor: '#4ade80',
            data: [50, 70, 65, 90, 80, 40, 30]
          },
          {
            label: 'CPF',
            backgroundColor: '#60a5fa',
            data: [60, 65, 70, 85, 90, 50, 35]
          },
          {
            label: 'Carteira de Trabalho',
            backgroundColor: '#fbbf24',
            data: [30, 50, 45, 60, 55, 25, 20]
          },
          {
            label: 'Comprovante Endereço',
            backgroundColor: '#a78bfa',
            data: [25, 35, 40, 50, 60, 30, 15]
          }
        ]
      };


      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
          legend: {
            labels: {
              color: textColor
            }
          },
          title: {
            display: true,
            text: 'Documentos Processados por Dia',
            color: textColor,
            font: {
              size: 16
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
              font: {
                weight: 500
              }
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            }
          },
          y: {
            ticks: {
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            }
          }
        }
      };
      this.cd.markForCheck()
    }
  }

}