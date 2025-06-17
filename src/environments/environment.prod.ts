export const environment = {
  production: true,
  apiUrl: "https://api.yourdomain.com/api",
  enableDebug: false,
  version: "1.0.0",
  oidc: {
    authority:
      "https://your-production-oidc-provider.com/auth/realms/your-realm",
    clientId: "your-production-client-id",
    redirectUri: "https://your-production-app.com/auth/callback",
    postLogoutRedirectUri: "https://your-production-app.com/",
    scope: "openid profile email",
    responseType: "code",
    endSessionEndpoint:
      "https://your-production-oidc-provider.com/auth/realms/your-realm/protocol/openid-connect/logout",
  },
};
