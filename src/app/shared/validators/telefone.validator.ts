import { AbstractControl, ValidationErrors } from '@angular/forms';

export function telefoneValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value?.trim();

    if (!value) return null;
    const cleanValue = value.replace(/\s/g, '');
    const telefoneRegex = /^\(\d{2}\)9?\d{4}-\d{4}$/;
    if (!telefoneRegex.test(cleanValue)) {
        return { telefoneInvalido: true };
    }

    return null; // Retorna null se válido
}