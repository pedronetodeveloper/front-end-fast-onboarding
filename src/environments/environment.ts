export const environment = {
  production: false,
  msalConfig: {
    auth: {
      clientId: '57e39326-d225-42b0-9eb5-ff1cfc0a96f7',
      authority: 'https://login.microsoftonline.com/e7c72598-c7ab-48a2-8f4b-398aad8e1daa',
      redirectUri: '/home',
      postLogoutRedirectUri: '/login'
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    }
  },
  apiConfig: {
    scopes: ['user.read'],
    uri: 'https://graph.microsoft.com/v1.0/me'
  },
  api: {
    scope: 'api://57e39326-d225-42b0-9eb5-ff1cfc0a96f7/access_as_user',
    url: 'http://localhost:8080/api/v1',
  }
};
