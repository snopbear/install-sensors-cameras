export const environment = {
  production: false,
  apiUrl: "http://localhost:3000",
  jsonServerUrl: "http://localhost:3000",
  enableDebug: true,
  version: "1.0.0-dev",
  oidc: {
    authority: "https://your-oidc-provider.com/auth/realms/your-realm",
    clientId: "your-client-id",
    redirectUri: "http://localhost:4200/auth/callback",
    postLogoutRedirectUri: "http://localhost:4200/",
    scope: "openid profile email",
    responseType: "code",
    endSessionEndpoint:
      "https://your-oidc-provider.com/auth/realms/your-realm/protocol/openid-connect/logout",
    // Optional:
    automaticSilentRenew: true,
    silentRedirectUri: "http://localhost:4200/auth/silent-renew",
    loadUserInfo: true,
  },
};

