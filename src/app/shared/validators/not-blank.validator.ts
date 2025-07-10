import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function notBlankValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;

        if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
            return { notBlank: true };
        }

        return null;
    };
}
