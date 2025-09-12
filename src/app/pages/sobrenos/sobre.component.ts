import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, CarouselModule],
  templateUrl: './sobre.component.html',
  styleUrls: ['./sobre.component.scss']
})
export class SobreComponent implements OnInit {
  
  empresas: any[] = [];
  depoimentos: any[] = [];
  
  constructor(private router: Router) {}
  
  responsiveOptions: any[] = [
    {
      breakpoint: '1199px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '991px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '767px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  ngOnInit() {
    this.empresas = [
      {
        id: 1,
        name: 'Empresa 1',
        image: '../../../assets/images/empresaqueconfiamnaDocFlow/001.png'
      },
      {
        id: 2,
        name: 'Empresa 2',
        image: '../../../assets/images/empresaqueconfiamnaDocFlow/002.png'
      },
      {
        id: 3,
        name: 'Empresa 3',
        image: '../../../assets/images/empresaqueconfiamnaDocFlow/003.png'
      },
      {
        id: 4,
        name: 'Empresa 4',
        image: '../../../assets/images/empresaqueconfiamnaDocFlow/004.png'
      },
      {
        id: 5,
        name: 'Empresa 5',
        image: '../../../assets/images/empresaqueconfiamnaDocFlow/005.png'
      }
    ];

    this.depoimentos = [
      {
        id: 1,
        nome: 'Ana Silva',
        cargo: 'Gerente de RH',
        empresa: 'Cyber Shield',
        depoimento: 'A DocFlow revolucionou nosso processo de admissão! Reduziu em 70% o tempo gasto com documentação e eliminou os erros manuais. Nossa equipe agora foca no que realmente importa: as pessoas.',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
        rating: 5
      },
      {
        id: 2,
        nome: 'Carlos Mendes',
        cargo: 'Diretor de Operações',
        empresa: 'Sentinel',
        depoimento: 'Implementamos a DocFlow há 6 meses e os resultados são impressionantes. A automação do OCR é precisa e a integração com nossos sistemas foi perfeita. Recomendo sem hesitar!',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        rating: 5
      },
      {
        id: 3,
        nome: 'Mariana Costa',
        cargo: 'Coordenadora de Admissões',
        empresa: 'Capital Link',
        depoimento: 'O que mais me impressiona na DocFlow é a facilidade de uso. Nossa equipe se adaptou rapidamente e agora conseguimos processar 3x mais admissões com a mesma equipe.',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        rating: 5
      },
      {
        id: 4,
        nome: 'Roberto Lima',
        cargo: 'CEO',
        empresa: 'Financier',
        depoimento: 'Como startup, precisávamos de agilidade sem comprometer a qualidade. A DocFlow nos deu exatamente isso. Nosso onboarding agora é referência no mercado!',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        rating: 5
      },
      {
        id: 5,
        nome: 'Fernanda Santos',
        cargo: 'Head de Pessoas',
        empresa: 'NexusTech',
        depoimento: 'A experiência dos nossos novos colaboradores melhorou drasticamente. O processo é fluido, digital e profissional. A DocFlow elevou nosso padrão de admissão.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        rating: 5
      }
    ];
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }
}
