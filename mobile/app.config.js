import "dotenv/config";

// Load .env variables into process.env; expo picks them up below.
// npm install dotenv if not already present

export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      LOCAL_IP: process.env.LOCAL_IP,
    },
  };
};
