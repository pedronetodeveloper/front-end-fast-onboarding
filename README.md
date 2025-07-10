# Fast Onboarding

Fast Onboarding é uma aplicação web moderna para verificação e gestão de documentos, com autenticação via Microsoft Azure Entra ID, suporte multilíngue (Português, Inglês e Espanhol) e temas claro/escuro.

## Funcionalidades Principais
- **Reconhecimento e validação rápida de documentos**
- **Autenticação segura** com Azure Entra ID
- **Internacionalização**: suporte completo a múltiplos idiomas
- **Design responsivo**: adaptado para desktop, tablet e mobile
- **Temas claro e escuro** com variáveis SCSS padronizadas
- **Dashboards e notificações rápidas**
- **Recursos LGPD**: transparência, controle do usuário e segurança de dados

## Tecnologias Utilizadas
- **Angular 19**
- **PrimeNG**
- **TypeScript**
- **SCSS**

## Estrutura do Projeto
```
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   └── services/
│   │   │       └── translation.service.ts
│   │   ├── layout/
│   │   ├── pages/
│   │   └── shared/
│   ├── assets/
│   ├── environments/
│   ├── styles.scss
│   └── index.html
├── angular.json
├── package.json
└── README.md
```

## Como Executar
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Rode o projeto:
   ```bash
   npm start
   ```
3. Acesse em `http://localhost:4200`

## Configuração de Idiomas
- O idioma padrão é o português, mas pode ser alterado no menu de configurações.
- Traduções completas para pt, en e es no arquivo `translation.service.ts`.

## Temas
- Alternância entre tema claro e escuro disponível no menu de configurações.
- Variáveis SCSS padronizadas para cores e opacidades.

## Autenticação
- Login via conta Microsoft (Azure Entra ID).
- Segurança e conformidade com LGPD.

## Scripts Úteis
- `npm start` — inicia o servidor de desenvolvimento
- `npm run build` — gera build de produção
- `npm run lint` — executa linter

## Contribuição
Pull requests são bem-vindos! Siga o padrão de código e mantenha as traduções atualizadas para os três idiomas.

## Licença
Este projeto é licenciado sob a licença MIT.
