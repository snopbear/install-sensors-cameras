export const environment = {
  production: true, // Typically staging is production-like
  apiUrl: "https://staging-api.yourdomain.com/api",
  enableDebug: true, // Might want debug on in staging
  version: "1.0.0-staging",
  analyticsId: "UA-XXXXXX-2", // Different from prod
  featureFlags: {
    newDashboard: true, // Test new features in staging
    experimentalApi: false,
  },
};
