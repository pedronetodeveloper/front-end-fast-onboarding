import { AbstractControl, ValidationErrors } from '@angular/forms';

export function cpfCnpjValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value?.trim();

    // Se o campo estiver vazio, não faz a validação
    if (!value) return { required: true };

    // Remove qualquer caracter que não seja número (para limpar o valor)
    const cleanValue = value.replace(/[^\d]/g, '');
    
    // Validação de CNPJ (14 dígitos)
    const cnpjRegex = /^[0-9]{14}$/;
    if (cnpjRegex.test(cleanValue)) {
        return validateCnpj(cleanValue) ? null : { cnpjInvalido: true };
    }

    return { cpfCnpjInvalido: true }; // Se não for nem CPF nem CNPJ válido
}

// Função para validar CNPJ
function validateCnpj(cnpj: string): boolean {
    // Lista de CNPJs com números repetidos, que são inválidos
    const invalidCnpjs = [
        '00000000000000', '11111111111111', '22222222222222', '33333333333333',
        '44444444444444', '55555555555555', '66666666666666', '77777777777777',
        '88888888888888', '99999999999999'
    ];

    // Se o CNPJ for igual a algum valor da lista de CNPJs inválidos, retorna falso
    if (invalidCnpjs.includes(cnpj)) {
        return false;
    }

    return true; // Se passar na validação, retorna true
}