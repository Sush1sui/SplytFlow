import { supabase } from "@/src/lib/db";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";

import { expo } from "@/app.json";
import { Text } from "@react-navigation/elements";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { useAuthContext } from "@/src/hooks/use-auth-context";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignInButton() {
  const { setProfile, setIsLoading } = useAuthContext();
  function extractParamsFromUrl(url: string) {
    const parsedUrl = new URL(url);
    const hash = parsedUrl.hash.substring(1); // Remove the leading '#'
    const params = new URLSearchParams(hash);

    return {
      access_token: params.get("access_token"),
      expires_in: parseInt(params.get("expires_in") || "0"),
      refresh_token: params.get("refresh_token"),
      token_type: params.get("token_type"),
      provider_token: params.get("provider_token"),
      code: params.get("code"),
    };
  }

  async function onSignInButtonPress() {
    console.debug("onSignInButtonPress - start");
    console.debug("onSignInButtonPress - calling signInWithOAuth");
    setIsLoading(true);
    const res = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${expo.scheme}://`,
        queryParams: { prompt: "consent" },
        skipBrowserRedirect: true,
      },
    });

    console.debug("onSignInButtonPress - signInWithOAuth complete", { res });
    const googleOAuthUrl = res.data.url;

    if (!googleOAuthUrl) {
      console.error("no oauth url found!");
      return;
    }

    console.debug(
      "onSignInButtonPress - opening browser with URL:",
      googleOAuthUrl
    );
    const result = await WebBrowser.openAuthSessionAsync(
      googleOAuthUrl,
      `${expo.scheme}://`
    ).catch((err) => {
      console.error("onSignInButtonPress - openAuthSessionAsync - error", {
        err,
      });
      console.log(err);
      return null;
    });

    console.debug("onSignInButtonPress - openAuthSessionAsync - result", {
      result,
      resultType: result?.type,
    });

    if (!result) {
      console.error("onSignInButtonPress - no result from browser");
      return;
    }

    if (result.type === "dismiss" || result.type === "cancel") {
      console.log("onSignInButtonPress - user cancelled or dismissed");
      return;
    }

    if (result && result.type === "success") {
      console.debug("onSignInButtonPress - openAuthSessionAsync - success");
      const params = extractParamsFromUrl(result.url);
      console.debug("onSignInButtonPress - openAuthSessionAsync - success", {
        params,
      });

      if (params.access_token && params.refresh_token) {
        // Call backend to create/verify user profile FIRST before setting session
        try {
          console.debug("onSignInButtonPress - calling backend create-user");
          const apiUrl =
            process.env.EXPO_PUBLIC_API_URL || "http://192.168.100.2:3000";
          console.debug("onSignInButtonPress - API URL:", apiUrl);
          const response = await fetch(`${apiUrl}/auth/create-user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ access_token: params.access_token }),
          });

          const result = await response.json();
          console.debug("onSignInButtonPress - backend response", {
            status: response.status,
            ok: response.ok,
            result,
          });

          if (!response.ok) {
            console.error("onSignInButtonPress - backend error", result);
            return;
          }

          console.debug(
            "onSignInButtonPress - user profile created/verified successfully"
          );

          // Set the profile directly from API response
          if (result.user) {
            console.debug("onSignInButtonPress - setting profile in context");
            setProfile({
              id: result.user.id.toString(),
              email: result.user.email,
              display_name: result.user.displayName,
              avatar_url: result.user.avatarUrl,
              created_at: result.user.createdAt,
            });
          }
        } catch (apiError) {
          console.error("onSignInButtonPress - API call failed", apiError);
          return;
        }

        // Now set the session AFTER user is created in database
        console.debug("onSignInButtonPress - setSession");
        const { data, error } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        console.debug("onSignInButtonPress - setSession - result", {
          hasSession: !!data.session,
          hasUser: !!data.user,
          error,
        });

        if (error) {
          console.error("onSignInButtonPress - setSession - error", error);
          return;
        }

        console.debug("onSignInButtonPress - sign in complete");
        // Don't navigate manually - let AuthProvider and routing handle it
        return;
      } else {
        console.error("onSignInButtonPress - setSession - failed");
        // sign in/up failed
      }
    } else {
      console.error("onSignInButtonPress - openAuthSessionAsync - failed");
    }
    setIsLoading(false);
  }

  // to warm up the browser
  useEffect(() => {
    WebBrowser.warmUpAsync();

    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  return (
    <TouchableOpacity
      onPress={onSignInButtonPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dbdbdb",
        borderRadius: 4,
        paddingVertical: 10,
        paddingHorizontal: 15,
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2, // For Android shadow
      }}
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri: "https://developers.google.com/identity/images/g-logo.png",
        }}
        style={{ width: 24, height: 24, marginRight: 10 }}
      />
      <Text
        style={{
          fontSize: 16,
          color: "#757575",
          fontFamily: "Roboto-Regular", // Assuming Roboto is available; install via expo-google-fonts or similar if needed
          fontWeight: "500",
        }}
      >
        Sign in with Google
      </Text>
    </TouchableOpacity>
  );
}
