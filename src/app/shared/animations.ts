import { trigger, style, transition, animate } from '@angular/animations';

/**
 * Animação de entrada da página - elemento surge de baixo para cima suavemente
 */
export const pageEnterAnimation = trigger('pageAnimation', [
  transition(':enter', [
    style({ 
      opacity: 0, 
      transform: 'translateY(30px)' 
    }),
    animate('600ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
      style({ 
        opacity: 1, 
        transform: 'translateY(0)' 
      })
    )
  ])
]);

/**
 * Animação de entrada rápida para cards e elementos
 */
export const cardEnterAnimation = trigger('cardAnimation', [
  transition(':enter', [
    style({ 
      opacity: 0, 
      transform: 'translateY(20px)' 
    }),
    animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
      style({ 
        opacity: 1, 
        transform: 'translateY(0)' 
      })
    )
  ])
]);

/**
 * Animação de fade in simples
 */
export const fadeInAnimation = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 }))
  ])
]);

/**
 * Animação de slide in da esquerda
 */
export const slideInLeftAnimation = trigger('slideInLeft', [
  transition(':enter', [
    style({ 
      opacity: 0, 
      transform: 'translateX(-30px)' 
    }),
    animate('500ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
      style({ 
        opacity: 1, 
        transform: 'translateX(0)' 
      })
    )
  ])
]);

/**
 * Animação de slide in da direita
 */
export const slideInRightAnimation = trigger('slideInRight', [
  transition(':enter', [
    style({ 
      opacity: 0, 
      transform: 'translateX(30px)' 
    }),
    animate('500ms cubic-bezier(0.25, 0.8, 0.25, 1)', 
      style({ 
        opacity: 1, 
        transform: 'translateX(0)' 
      })
    )
  ])
]);
