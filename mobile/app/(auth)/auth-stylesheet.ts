import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  inner: {
    width: "100%",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 10,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 20,
    borderRadius: 20,
  },
  title: {
    marginBottom: 8,
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  cardContent: {
    marginTop: 4,
  },
  footer: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  link: {
    fontSize: 14,
    fontWeight: "600",
  },
  forgotPassword: {
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.2,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    opacity: 0.5,
  },
});

export default styles;
