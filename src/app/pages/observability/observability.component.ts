import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashService } from '../../core/services/api/dash.service';
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
import { AuthUser } from '../../core/services/auth.service';
// Services
import { ConfirmationService, MessageService } from 'primeng/api';

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

  private dashService = inject(DashService);
  displayDialogInfo = false;

  
  economiaDeTempoDocs: any[] = [];
  kpisContratacao: any[] = [];
  docsProcessados: any[] = [];
  // KPIs de contratações e performance
  data: any;
  options: any;
  platformId = inject(PLATFORM_ID);
  numeroContratacoes: number = 0;
  docsProcessadosTotal: number = 0;
  taxaAprovacao: number = 0;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    const userString = localStorage.getItem('user');
    let user: AuthUser | null = null;

    if (userString) {
      user = JSON.parse(userString);
    }
    if (user) {
      this.loadContratacoes(user.empresa); 
      this.loadTaxaAprovacao(user.empresa);
      this.updateKpis();
    }
  }

  loadContratacoes(empresa?: string) {
    this.dashService.buscarContratacoes(empresa).subscribe(data => {
      this.numeroContratacoes = data.contratacoes;
      this.updateKpis();
    });
  }

  loadTaxaAprovacao(empresa?: string) {
    this.dashService.buscarTaxaAprovacao(empresa).subscribe(data => {
      this.taxaAprovacao = data.taxa_aprovacao;
      this.docsProcessadosTotal = data.total_documentos;
      this.updateKpis();
    });
  }

  private updateKpis() {
    this.kpisContratacao = [
      {
        label: 'observability.contratacoesMes',
        value: this.numeroContratacoes,
        icon: 'pi pi-users',
        color1: '#10b981',
        color2: '#059669',
        unit: 'contratações'
      },
      {
        label: 'observability.horasEconomizadas',
        value: this.numeroContratacoes * 10,
        icon: 'pi pi-clock',
        color1: '#8b5cf6',
        color2: '#7c3aed',
        unit: 'horas'
      },
      {
        label: 'observability.eficienciaProcesso',
        value: 94.5, 
        icon: 'pi pi-chart-line',
        color1: '#f59e0b',
        color2: '#d97706',
        unit: '%'
      },
      {
        label: 'observability.tempoMedioProcessamento',
        value: 18, 
        icon: 'pi pi-stopwatch',
        color1: '#ef4444',
        color2: '#dc2626',
        unit: 'segundos'
      },
      {
        label: 'observability.documentosProcessados',
        value: this.docsProcessadosTotal,
        icon: 'pi pi-file-check',
        color1: '#06b6d4',
        color2: '#0891b2',
        unit: 'docs'
      },
      {
        label: 'observability.taxaAprovacao',
        value: this.taxaAprovacao,
        icon: 'pi pi-check-circle',
        color1: '#22c55e',
        color2: '#16a34a',
        unit: '%'
      }
    ];
  }

  // initChart() {
  //   if ((this.platformId)) {
  //     const documentStyle = getComputedStyle(document.documentElement);
  //     const textColor = documentStyle.getPropertyValue('--p-text-color');
  //     const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
  //     const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

  //     // Preparar dados agrupados por tipo de documento e status
  //     const labels = this.docsProcessados.map(doc => {
  //       switch(doc.label) {
  //         case 'observability.rg': return 'RG';
  //         case 'observability.cpf': return 'CPF';
  //         case 'observability.carteiraTrabalho': return 'Carteira de Trabalho';
  //         case 'observability.tituloEleitor': return 'Título de Eleitor';
  //         case 'observability.comprovanteEndereco': return 'Comprovante de Endereço';
  //         default: return doc.label;
  //       }
  //     });

  //     this.data = {
  //       labels: labels,
  //       datasets: [
  //         {
  //           label: 'Aprovado',
  //           backgroundColor: '#22c55e',
  //           borderColor: '#16a34a',
  //           borderWidth: 1,
  //           data: this.docsProcessados.map(doc => doc.status.aprovado)
  //         },
  //         {
  //           label: 'Reprovado',
  //           backgroundColor: '#ef4444',
  //           borderColor: '#dc2626',
  //           borderWidth: 1,
  //           data: this.docsProcessados.map(doc => doc.status.reprovado)
  //         },
  //         {
  //           label: 'Pendente',
  //           backgroundColor: '#f59e0b',
  //           borderColor: '#d97706',
  //           borderWidth: 1,
  //           data: this.docsProcessados.map(doc => doc.status.pendente)
  //         }
  //       ]
  //     };

  //     this.options = {
  //       maintainAspectRatio: false,
  //       aspectRatio: 0.8,
  //       responsive: true,
  //       plugins: {
  //         legend: {
  //           position: 'top',
  //           labels: {
  //             color: textColor,
  //             usePointStyle: true,
  //             padding: 20,
  //             font: {
  //               size: 12,
  //               weight: '500'
  //             }
  //           }
  //         },
  //         title: {
  //           display: true,
  //           text: 'Status dos Documentos por Tipo',
  //           color: textColor,
  //           font: {
  //             size: 16,
  //             weight: '600'
  //           },
  //           padding: {
  //             top: 10,
  //             bottom: 30
  //           }
  //         },
  //         tooltip: {
  //           mode: 'index',
  //           intersect: false,
  //           backgroundColor: 'rgba(0, 0, 0, 0.8)',
  //           titleColor: '#fff',
  //           bodyColor: '#fff',
  //           borderColor: surfaceBorder,
  //           borderWidth: 1,
  //           cornerRadius: 8,
  //           displayColors: true,
  //           callbacks: {
  //             label: function(context: any) {
  //               return context.dataset.label + ': ' + context.parsed.y + ' documentos';
  //             }
  //           }
  //         }
  //       },
  //       scales: {
  //         x: {
  //           ticks: {
  //             color: textColorSecondary,
  //             font: {
  //               weight: '500',
  //               size: 11
  //             },
  //             maxRotation: 45,
  //             minRotation: 0
  //           },
  //           grid: {
  //             color: surfaceBorder,
  //             drawBorder: false,
  //             display: false
  //           }
  //         },
  //         y: {
  //           beginAtZero: true,
  //           ticks: {
  //             color: textColorSecondary,
  //             font: {
  //               size: 11
  //             },
  //             callback: function(value: any) {
  //               return value + ' docs';
  //             }
  //           },
  //           grid: {
  //             color: surfaceBorder,
  //             drawBorder: false
  //           }
  //         }
  //       },
  //       interaction: {
  //         mode: 'nearest',
  //         axis: 'x',
  //         intersect: false
  //       }
  //     };
  //     this.cd.markForCheck()
  //   }
  // }

    // loadDocumentosPorTipo(empresa?: string) {
  //   this.dashService.buscarDocumentosPorTipo(empresa).subscribe(data => {
  //       const newDocsProcessados: any[] = [];
  //       const docMap: any = {
  //           'rg': { label: 'observability.rg', icon: 'pi pi-id-card', color1: '#4ade80', color2: '#22c55e' },
  //           'cpf': { label: 'observability.cpf', icon: 'pi pi-user', color1: '#60a5fa', color2: '#3b82f6' },
  //           'carteira de trabalho': { label: 'observability.carteiraTrabalho', icon: 'pi pi-briefcase', color1: '#fbbf24', color2: '#f59e0b'},
  //           'comprovante de residencia': { label: 'observability.comprovanteEndereco', icon: 'pi pi-map-marker', color1: '#a78bfa', color2: '#8b5cf6'},
  //           'titulo de eleitor': { label: 'observability.tituloEleitor', icon: 'pi pi-vote', color1: '#a78bfa', color2: '#8b5cf6'}
  //       };
  //       for (const docType in data) {
  //           if (data.hasOwnProperty(docType)) {
  //               const docData = data[docType];
  //               const docConfig = docMap[docType];
  //               if (docConfig) {
  //                   newDocsProcessados.push({
  //                       label: docConfig.label,
  //                       count: docData.total,
  //                       icon: docConfig.icon,
  //                       color1: docConfig.color1,
  //                       color2: docConfig.color2,
  //                       status: { 
  //                           aprovado: docData.aprovado, 
  //                           reprovado: docData.reprovado, 
  //                           pendente: docData.pendente 
  //                       }
  //                   });
  //               }
  //           }
  //       }
  //       this.docsProcessados = newDocsProcessados;
  //      this.docsProcessados = [...newDocsProcessados];
  //       this.cd.detectChanges();
  //       this.initChart();
  //     });
  // }
  // this.loadDocumentosPorTipo(user.empresa);

}