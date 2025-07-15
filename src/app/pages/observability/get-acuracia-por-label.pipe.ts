import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getAcuraciaPorLabel',
  standalone: true
})
export class GetAcuraciaPorLabelPipe implements PipeTransform {
  transform(acuraciaDocs: any[], label: string): string {
    if (!Array.isArray(acuraciaDocs)) return '-';
    const found = acuraciaDocs.find(doc => doc.label === label);
    return found && found.value != null ? found.value.toString() : '-';
  }
}
