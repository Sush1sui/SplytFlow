import "dotenv/config";

export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      LOCAL_IP: process.env.LOCAL_IP,
      LOCAL_PORT: process.env.LOCAL_PORT,
    },
  };
};
