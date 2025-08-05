// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.dev.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiConfig: {
    scopes: ['user.read'],
    uri: 'https://graph.microsoft.com/v1.0/me'
  },
  api: {
    scope: 'api://57e39326-d225-42b0-9eb5-ff1cfc0a96f7/access_as_user',
    url: '?',
  }
};
