import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  BackHandler,
  Platform,
  ActivityIndicator,
  View,
  Linking,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";
import * as SplashScreen from "expo-splash-screen";

import { SITE_URL, isAllowedUrl } from "./src/constants/config";
import { WebPreviewSite, OfflineScreen } from "./src/components";
import { styles } from "./src/styles/styles";

// Runs once per page, only touches videos it hasn't processed yet, and only
// reacts when a <video> is actually added (no work on every DOM mutation).
// Also injects a touch-action rule so taps respond instantly on iOS.
const INJECTED_VIDEO_FIX = `
  (function () {
    if (window.__inlineVideoFix) return;
    window.__inlineVideoFix = true;

    var style = document.createElement('style');
    style.textContent =
      'html{-webkit-text-size-adjust:100%;}' +
      'a,button,[role=button],input,select,textarea,label{touch-action:manipulation;}';
    (document.head || document.documentElement).appendChild(style);

    var scheduled = false;

    function fix() {
      scheduled = false;
      var videos = document.querySelectorAll('video:not([data-rn-fixed])');
      for (var i = 0; i < videos.length; i++) {
        var v = videos[i];
        v.setAttribute('data-rn-fixed', '1');
        v.setAttribute('playsinline', 'true');
        v.setAttribute('webkit-playsinline', 'true');
        v.setAttribute('x5-playsinline', 'true');
        v.playsInline = true;
        if (v.hasAttribute('autoplay') || v.autoplay || v.loop) {
          v.muted = true;
          v.defaultMuted = true;
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        }
      }
    }

    function schedule() {
      if (scheduled) return;
      scheduled = true;
      setTimeout(fix, 300);
    }

    function hasVideo(nodes) {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n.nodeType !== 1) continue;
        if (n.tagName === 'VIDEO' || (n.querySelector && n.querySelector('video'))) {
          return true;
        }
      }
      return false;
    }

    function observe() {
      if (!window.MutationObserver || !document.documentElement) return;
      new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          if (hasVideo(mutations[i].addedNodes)) {
            schedule();
            return;
          }
        }
      }).observe(document.documentElement, { childList: true, subtree: true });
    }

    if (document.documentElement) {
      observe();
    } else {
      document.addEventListener('DOMContentLoaded', observe);
    }
    document.addEventListener('DOMContentLoaded', schedule);
    window.addEventListener('load', schedule);
    schedule();
  })();
  true;
`;

SplashScreen.preventAutoHideAsync().catch(() => {});

// Stable object so the WebView never sees a "new" source on re-render.
const WEBVIEW_SOURCE = { uri: SITE_URL };

const progressStyles = StyleSheet.create({
  track: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    overflow: "hidden",
    zIndex: 10,
  },
  bar: { height: 2, backgroundColor: "#111111" },
});

// Hooks must not come after a conditional return, so the platform
// check lives in a thin wrapper and the native logic in its own component.
export default function App() {
  if (Platform.OS === "web") {
    return <WebPreviewSite />;
  }
  return <NativeApp />;
}

function NativeApp() {
  const webviewRef = useRef(null);
  const splashHiddenRef = useRef(false);
  const hasErrorRef = useRef(false);

  const [canGoBack, setCanGoBack] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Driven with the native driver and never stored in React state,
  // so page-load progress causes zero re-renders.
  const { width } = useWindowDimensions();
  const progress = useRef(new Animated.Value(0)).current;
  const barOpacity = useRef(new Animated.Value(0)).current;

  const hideSplash = useCallback(() => {
    if (splashHiddenRef.current) return;
    splashHiddenRef.current = true;
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Android hardware back button
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack && webviewRef.current) {
        webviewRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  // Connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false);
    });
    return unsubscribe;
  }, []);

  // If the app starts offline the WebView never reports a load,
  // so the splash screen must be hidden here as well.
  useEffect(() => {
    if (isOffline) hideSplash();
  }, [isOffline, hideSplash]);

  // Auto-reload when the connection comes back after a failed load
  useEffect(() => {
    if (!isOffline && hasErrorRef.current && webviewRef.current) {
      hasErrorRef.current = false;
      setHasError(false);
      setLoading(true);
      webviewRef.current.reload();
    }
  }, [isOffline]);

  const onLoadStart = useCallback(() => {
    progress.setValue(0);
    barOpacity.setValue(1);
  }, [progress, barOpacity]);

  const onLoadProgress = useCallback(
    ({ nativeEvent }) => {
      Animated.timing(progress, {
        toValue: nativeEvent.progress,
        duration: 120,
        useNativeDriver: true,
      }).start();
    },
    [progress]
  );

  const onLoadEnd = useCallback(() => {
    setLoading(false);
    hideSplash();
    Animated.sequence([
      Animated.timing(progress, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(barOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [hideSplash, progress, barOpacity]);

  const reloadWebView = useCallback(() => {
    webviewRef.current?.reload();
  }, []);

  const onError = useCallback(() => {
    hasErrorRef.current = true;
    setHasError(true);
    setLoading(false);
    hideSplash();
  }, [hideSplash]);

  const onNavigationStateChange = useCallback((navState) => {
    setCanGoBack(navState.canGoBack);
  }, []);

  const handleRetry = useCallback(async () => {
    const state = await NetInfo.fetch();
    const offline = state.isConnected === false;
    setIsOffline(offline);
    if (!offline && webviewRef.current) {
      hasErrorRef.current = false;
      setHasError(false);
      setLoading(true);
      webviewRef.current.reload();
    }
  }, []);

  const handleShouldStartLoad = useCallback((request) => {
    const { url, isTopFrame } = request;

    // Let iframes (embeds, payment widgets, etc.) load normally.
    // `isTopFrame` is only provided on iOS; undefined passes through.
    if (isTopFrame === false || url === "about:blank") return true;

    if (/^https?:\/\//i.test(url) && isAllowedUrl(url)) return true;

    // External links, tel:, mailto:, intent:, etc. -> hand off to the OS
    Linking.openURL(url).catch(() => {});
    return false;
  }, []);

  const showOffline = isOffline || hasError;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <StatusBar style="dark" backgroundColor="#ffffff" />

        <View pointerEvents="none" style={progressStyles.track}>
          <Animated.View
            style={[
              progressStyles.bar,
              {
                opacity: barOpacity,
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-width, 0],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>

        {/* Keep the WebView mounted so page state and history survive
            going offline; the offline screen simply covers it. */}
        <WebView
          ref={webviewRef}
          source={WEBVIEW_SOURCE}
          style={styles.webview}
          onLoadStart={onLoadStart}
          onLoadProgress={onLoadProgress}
          onLoadEnd={onLoadEnd}
          onError={onError}
          onHttpError={onError}
          onNavigationStateChange={onNavigationStateChange}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          injectedJavaScriptBeforeContentLoaded={INJECTED_VIDEO_FIX}
          pullToRefreshEnabled
          domStorageEnabled
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo
          setSupportMultipleWindows={false}
          // Recover if the OS kills the web content process
          onRenderProcessGone={reloadWebView}
          {...(Platform.OS === "ios"
            ? {
                allowsBackForwardNavigationGestures: true,
                sharedCookiesEnabled: true,
                allowsInlineMediaPlayback: true,
                // iOS scroll smoothness: SafeAreaView already handles insets, so stop
                // WKWebView from adjusting them again (causes jumps and jank)
                contentInsetAdjustmentBehavior: "never",
                automaticallyAdjustContentInsets: false,
                decelerationRate: "normal",
                // Skip phone/link scanning of page content and long-press previews
                dataDetectorTypes: "none",
                allowsLinkPreview: false,
                onContentProcessDidTerminate: reloadWebView,
              }
            : {})}
        />

        {loading && !showOffline && (
          <View
            style={[StyleSheet.absoluteFill, styles.loaderOverlay]}
            pointerEvents="none"
          >
            <ActivityIndicator size="large" color="#111111" />
          </View>
        )}

        {showOffline && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: "#ffffff" }]}>
            <OfflineScreen onRetry={handleRetry} />
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}