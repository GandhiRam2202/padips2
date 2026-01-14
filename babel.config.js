module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // This refers to the module that is "missing"
    plugins: [
      'react-native-reanimated/plugin', // Keep this last!
    ],
  };
};