import { AbstractControl, ValidationErrors } from '@angular/forms';

export function cpfCnpjValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value?.trim();

    // Se o campo estiver vazio, não faz a validação
    if (!value) return { required: true };

    // Remove qualquer caracter que não seja número (para limpar o valor)
    const cleanValue = value.replace(/[^\d]/g, '');
    // Validação de CPF (11 dígitos)
    const cpfRegex = /^[0-9]{11}$/;
    if (cpfRegex.test(cleanValue)) {
        return validateCpf(cleanValue) ? null : { cpfInvalido: true };
    }

    return { cpfCnpjInvalido: true }; // Se não for nem CPF nem CNPJ válido
}

function validateCpf(cpf: string): boolean {
    if (cpf === '00000000000' || cpf === '11111111111' || cpf === '22222222222' || cpf === '33333333333' ||
        cpf === '44444444444' || cpf === '55555555555' || cpf === '66666666666' || cpf === '77777777777' ||
        cpf === '88888888888' || cpf === '99999999999') {
        return false; // CPFs falsos
    }

    let sum = 0;
    let remainder: number;

    // Valida primeiro dígito
    for (let i = 0; i < 9; i++) {
        sum += Number(cpf[i]) * (10 - i);
    }
    remainder = sum % 11;
    if (remainder < 2) {
        remainder = 0;
    } else {
        remainder = 11 - remainder;
    }
    if (Number(cpf[9]) !== remainder) {
        return false;
    }

    sum = 0;
    // Valida segundo dígito
    for (let i = 0; i < 10; i++) {
        sum += Number(cpf[i]) * (11 - i);
    }
    remainder = sum % 11;
    if (remainder < 2) {
        remainder = 0;
    } else {
        remainder = 11 - remainder;
    }
    return Number(cpf[10]) === remainder;
}