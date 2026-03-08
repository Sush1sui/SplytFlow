import React, { useMemo } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Tabs } from "expo-router";
import {
  BottomTabBarProps,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import useBottomTabStyles from "./bottom-tab-styles";
import { useThemeColor } from "@/hooks/use-theme-color";

// mapping route names to icon placeholders
const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: "home-outline",
  sales: "cash-outline",
  config: "construct-outline",
  settings: "settings-outline",
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { styles, iconSize } = useBottomTabStyles();
  const background = useThemeColor({}, "background");
  const defaultColor = useThemeColor({}, "tabIconDefault");
  const selectedColor = useThemeColor({}, "tabIconSelected");

  // use the unselected icon color at low opacity for the top border
  const borderColor = `${defaultColor}20`;

  // memoize so filter+sort don't allocate new arrays on every render
  const sortedRoutes = useMemo(
    () =>
      state.routes
        .filter((r) => r.name !== "index")
        .sort((a, b) => {
          const clean = (n: string) => n.replace(/[()]/g, "");
          const order = ["home", "sales", "config", "settings"];
          return order.indexOf(clean(a.name)) - order.indexOf(clean(b.name));
        }),
    [state.routes],
  );

  return (
    <View
      style={[
        styles.tabBar,
        { backgroundColor: background, borderTopColor: borderColor },
      ]}
    >
      {sortedRoutes.map((route) => {
        // compare keys, not array indices – after filter+sort the index no longer
        // matches state.index (which references the original unordered array)
        const isFocused = state.routes[state.index].key === route.key;
        const { options } = descriptors[route.key] as {
          options: BottomTabNavigationOptions;
        };

        // strip parentheses used for grouping in route names
        const cleanName = route.name.replace(/[()]/g, "");

        let labelRaw =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : cleanName;
        const label =
          typeof labelRaw === "string" ? labelRaw : String(labelRaw);

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const iconName = ICON_MAP[cleanName] || "ellipse-outline";
        const color = isFocused ? selectedColor : defaultColor;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            // optional property removed because it isn't part of navigation options
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Ionicons name={iconName} size={iconSize} color={color} />
            <Text style={[styles.label, { color }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/**
 * BottomTabNavigator wraps an expo-router Tabs navigator with a custom
 * tab bar. The four screens are home, sales, config, and settings.
 *
 * The color scheme and spacing are drawn from the shared theme so that
 * the bar will look consistent with the rest of the app's UI.
 */
export default function BottomTabNavigator() {
  // Expo Router will infer the tab screens from the filesystem, so we don't
  // need to declare them manually.  The custom bar will hide the internal
  // "index" route and strip group parentheses when rendering icons/labels.
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    />
  );
}
