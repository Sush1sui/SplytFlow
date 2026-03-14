import "dotenv/config";

// Load .env variables into process.env; expo picks them up below.
// npm install dotenv if not already present

export default ({ config }) => {
  const plugins = Array.isArray(config.plugins) ? [...config.plugins] : [];
  if (!plugins.includes("@react-native-community/datetimepicker")) {
    plugins.push("@react-native-community/datetimepicker");
  }

  return {
    ...config,
    plugins,
    extra: {
      ...config.extra,
      LOCAL_IP: process.env.LOCAL_IP,
      LOCAL_PORT: process.env.LOCAL_PORT,
    },
  };
};
