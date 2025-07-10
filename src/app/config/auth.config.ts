import { environment } from '../../environments/environment';

// Azure Entra ID (formerly Azure AD) Configuration
// Configuration is now loaded from environment files
export const msalConfig = environment.msalConfig;

// Scopes for Microsoft Graph API
export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile']
};
