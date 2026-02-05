export default ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    eas: {
      projectId: "ca53f19b-8c5e-477d-816b-2bc1fadfa577",
    },
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
    API_KEY: process.env.EXPO_PUBLIC_API_KEY,
  },
});
