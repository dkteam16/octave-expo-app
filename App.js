import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  BackHandler,
  Platform,
  ActivityIndicator,
  View,
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";
import * as SplashScreen from "expo-splash-screen";

import { SITE_URL, isAllowedUrl } from "./src/constants/config";
import {
  WebPreviewSite,
  OfflineScreen,
  CouponScreen,
} from "./src/components";
import { styles } from "./src/styles/styles";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  if (Platform.OS === "web") {
    return <WebPreviewSite />;
  }

  const webviewRef = useRef(null);

  const [canGoBack, setCanGoBack] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCoupon, setShowCoupon] = useState(true);
  const [couponStep, setCouponStep] = useState("select");

  const handleCouponComplete = useCallback(() => {
    setShowCoupon(false);
  }, []);

  useEffect(() => {
    // Ensure splash screen is hidden on launch so CouponScreen or OfflineScreen is visible
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const onBackPress = () => {
      if (canGoBack && webviewRef.current) {
        webviewRef.current.goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [canGoBack]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false);
    });
    return () => unsubscribe();
  }, []);

  const onLoadEnd = useCallback(() => {
    setLoading(false);
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const onLoadError = useCallback(() => {
    setLoading(false);
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const handleRetry = useCallback(() => {
    NetInfo.fetch().then((state) => {
      const offline = state.isConnected === false;
      setIsOffline(offline);
      if (!offline && webviewRef.current) {
        webviewRef.current.reload();
      }
    });
  }, []);

  const handleShouldStartLoad = (request) => {
    const url = request.url;

    if (url === "about:blank") {
      return true;
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
      if (isAllowedUrl(url)) {
        return true;
      } else {
        Linking.openURL(url).catch(() => {});
        return false;
      }
    }

    Linking.openURL(url).catch(() => {});
    return false;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[
          styles.safeArea,
          showCoupon && couponStep === "select" && styles.couponDarkSafeArea,
        ]}
        edges={["top", "bottom"]}
      >
        <StatusBar
          style={showCoupon && couponStep === "select" ? "light" : "dark"}
          backgroundColor={
            showCoupon && couponStep === "select" ? "#1c1714" : "#ffffff"
          }
        />

        {isOffline ? (
          <OfflineScreen onRetry={handleRetry} />
        ) : (
          <View style={{ flex: 1, position: "relative" }}>
            <WebView
              {...(Platform.OS !== "web" ? { ref: webviewRef } : {})}
              source={{ uri: SITE_URL }}
              style={styles.webview}
              startInLoadingState
              onLoadEnd={onLoadEnd}
              onError={onLoadError}
              onNavigationStateChange={(navState) =>
                setCanGoBack(navState.canGoBack)
              }
              onShouldStartLoadWithRequest={handleShouldStartLoad}
              pullToRefreshEnabled
              allowsBackForwardNavigationGestures
              sharedCookiesEnabled
              domStorageEnabled
              javaScriptEnabled
              cacheEnabled
              renderError={() => <OfflineScreen onRetry={handleRetry} />}
            />

            {loading && !showCoupon && (
              <View style={styles.loaderOverlay}>
                <ActivityIndicator size="large" color="#111111" />
              </View>
            )}

            {showCoupon && (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    zIndex: 20,
                    backgroundColor:
                      couponStep === "select" ? "#1c1714" : "#ffffff",
                  },
                ]}
              >
                <CouponScreen
                  onComplete={handleCouponComplete}
                  onStepChange={setCouponStep}
                />
              </View>
            )}
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}