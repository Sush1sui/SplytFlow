/**
 * Type declarations for React Navigation theme
 */

import "@react-navigation/native";

declare module "@react-navigation/native" {
  export interface Theme {
    dark: boolean;
    colors: {
      primary: string;
      background: string;
      card: string;
      text: string;
      border: string;
      notification: string;
    };
    fonts: {
      regular: {
        fontFamily: string;
        fontWeight: "400";
      };
      medium: {
        fontFamily: string;
        fontWeight: "500";
      };
      bold: {
        fontFamily: string;
        fontWeight: "700";
      };
      heavy: {
        fontFamily: string;
        fontWeight: "800";
      };
    };
  }
}
