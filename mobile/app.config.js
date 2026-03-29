import "dotenv/config";

export default ({ config }) => {
  return {
    ...config,
    android: {
      ...config.android,
      package: "com.sush1sui.splytflow",
    },
    extra: {
      ...config.extra,
      LOCAL_IP: process.env.LOCAL_IP,
      LOCAL_PORT: process.env.LOCAL_PORT,
    },
  };
};
