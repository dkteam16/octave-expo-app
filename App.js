import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  BackHandler,
  Platform,
  ActivityIndicator,
  View,
  Text,
  Pressable,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import * as SplashScreen from 'expo-splash-screen';

// Keep the native splash screen visible until the WebView reports it has
// actually finished loading (not just "app JS started").
SplashScreen.preventAutoHideAsync().catch(() => {});

const SITE_URL = 'https://octave.co.in/';

// Only allow navigation within your own domain + known checkout/payment/auth
// redirects. Anything else gets opened in the system browser.
const ALLOWED_HOSTS = [
  'octave.co.in',
  'shopify.com',
  'myshopify.com',
  'shop.app',
  'gokwik.co',
  'razorpay.com',
  'paytm.com',
  'phonepe.com',
  'google.com',
  'facebook.com',
];

function isAllowedUrl(url) {
  try {
    const host = new URL(url).hostname;
    return ALLOWED_HOSTS.some((allowed) => host.endsWith(allowed));
  } catch (e) {
    return false;
  }
}

export default function App() {
  if (Platform.OS === 'web') {
    return <WebPreviewSite />;
  }

  const webviewRef = useRef(null);

  const [canGoBack, setCanGoBack] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  // Android hardware back button navigates WebView history instead of
  // exiting the app immediately.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onBackPress = () => {
      if (canGoBack && webviewRef.current) {
        webviewRef.current.goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [canGoBack]);

  // Track real device connectivity. Only mark offline when connectivity is explicitly lost
  // to avoid false positives from transient state.isInternetReachable checks on app launch.
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
      if (!offline) {
        webviewRef.current?.reload();
      }
    });
  }, []);

  const handleShouldStartLoad = (request) => {
    const url = request.url;

    // Allow internal about:blank page load
    if (url === 'about:blank') {
      return true;
    }

    // Check standard web URLs
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (isAllowedUrl(url)) {
        return true;
      } else {
        // Open external links (like social media/blogs) in the system browser
        Linking.openURL(url).catch(() => {});
        return false;
      }
    }

    // Handle custom schemes (like mailto:, tel:, upi:, whatsapp:) using native linking
    Linking.openURL(url).catch(() => {});
    return false;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar style="dark" backgroundColor="#ffffff" />

        {isOffline ? (
          <OfflineScreen onRetry={handleRetry} />
        ) : (
          <>
            {loading && (
              <View style={styles.loaderOverlay}>
                <ActivityIndicator size="large" color="#111111" />
              </View>
            )}
            <WebView
              {...(Platform.OS !== 'web' ? { ref: webviewRef } : {})}
              source={{ uri: SITE_URL }}
              style={styles.webview}
              startInLoadingState
              onLoadEnd={onLoadEnd}
              onError={onLoadError}
              onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
              onShouldStartLoadWithRequest={handleShouldStartLoad}
              pullToRefreshEnabled
              allowsBackForwardNavigationGestures
              sharedCookiesEnabled
              domStorageEnabled
              javaScriptEnabled
              renderError={() => (
                <OfflineScreen onRetry={handleRetry} />
              )}
            />
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function WebPreviewSite() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;

  return (
    <View style={styles.webContainer}>
      <View style={[styles.webContent, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
        {/* Left Side: Instructions */}
        <View style={styles.instructionsPanel}>
          <Text style={styles.webBrand}>OCTAVE</Text>
          <Text style={styles.webTitle}>Mobile App Wrapper</Text>
          <Text style={styles.webSubTitle}>Web Preview Mode</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🔒 Shopify Frame Protection</Text>
            <Text style={styles.infoText}>
              Shopify storefronts enforce <Text style={styles.codeText}>X-Frame-Options: DENY</Text> to protect users from clickjacking. 
              Because of this, web browsers block live Shopify stores from loading inside an iframe (web webview).
            </Text>
          </View>

          <Text style={styles.sectionTitle}>How to test the Live App:</Text>
          
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Start the development server</Text>
              <Text style={styles.stepDesc}>Run <Text style={styles.codeText}>npm run android</Text> or <Text style={styles.codeText}>npm run ios</Text> in your terminal.</Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Open the Mobile Emulator</Text>
              <Text style={styles.stepDesc}>Press <Text style={styles.codeText}>a</Text> to open Android Emulator, or <Text style={styles.codeText}>i</Text> to open iOS Simulator.</Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Test on your Physical Phone</Text>
              <Text style={styles.stepDesc}>Install the <Text style={styles.boldText}>Expo Go</Text> app, and scan the QR code displayed in the terminal.</Text>
            </View>
          </View>
        </View>

        {/* Right Side: Phone Mockup */}
        <View style={styles.phoneFrameContainer}>
          <View style={styles.phoneFrame}>
            {/* Speaker & Camera Notch */}
            <View style={styles.phoneDynamicIsland} />
            
            {/* Phone screen */}
            <View style={styles.phoneScreen}>
              {/* Simulated Status Bar */}
              <View style={styles.phoneStatusBar}>
                <Text style={styles.statusTime}>09:41</Text>
                <View style={styles.statusIcons}>
                  <Text style={styles.statusIcon}>📶</Text>
                  <Text style={styles.statusIcon}>🔋</Text>
                </View>
              </View>

              {/* Simulated Address Bar */}
              <View style={styles.addressBar}>
                <Text style={styles.addressText}>🔒 octave.co.in</Text>
              </View>

              {/* App Content Preview */}
              <View style={styles.mockAppContent}>
                <Text style={styles.mockAppBrand}>OCTAVE</Text>
                <View style={styles.mockNav}>
                  <Text style={styles.mockNavItemActive}>Men</Text>
                  <Text style={styles.mockNavItem}>Women</Text>
                  <Text style={styles.mockNavItem}>Kids</Text>
                  <Text style={styles.mockNavItem}>Sale</Text>
                </View>

                {/* Mock Banner */}
                <View style={styles.mockHeroBanner}>
                  <Text style={styles.mockHeroTitle}>METTLE</Text>
                  <Text style={styles.mockHeroSub}>New Arrivals '26</Text>
                </View>

                {/* Simulated Warning in App */}
                <View style={styles.mockWarningCard}>
                  <Text style={styles.mockWarningTitle}>Native Wrapper Ready</Text>
                  <Text style={styles.mockWarningText}>
                    The Shopify wrapper is configured and fully ready for Android & iOS!
                  </Text>
                  <Text style={styles.mockWarningTextSmall}>
                    To load the live storefront, run this project on a mobile simulator or device.
                  </Text>
                </View>

                {/* Mock Products */}
                <View style={styles.mockProductsGrid}>
                  <View style={styles.mockProduct}>
                    <View style={styles.mockProductImage} />
                    <Text style={styles.mockProductTitle}>Classic Polo</Text>
                    <Text style={styles.mockProductPrice}>₹1,499</Text>
                  </View>
                  <View style={styles.mockProduct}>
                    <View style={styles.mockProductImage2} />
                    <Text style={styles.mockProductTitle}>Slim Fit Denim</Text>
                    <Text style={styles.mockProductPrice}>₹2,499</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function OfflineScreen({ onRetry }) {
  return (
    <View style={styles.offlineContainer}>
      <Text style={styles.offlineBrand}>OCTAVE</Text>
      <Text style={styles.offlineTitle}>You're Offline</Text>
      <Text style={styles.offlineText}>
        Please check your internet connection and try again.
      </Text>
      <Pressable style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>TRY AGAIN</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  webview: { flex: 1, backgroundColor: '#ffffff' },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  offlineBrand: {
    position: 'absolute',
    top: 24,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 4,
    color: '#111111',
  },
  offlineTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    color: '#111111',
  },
  offlineText: {
    fontSize: 14,
    color: '#6b6b6b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  retryButton: {
    backgroundColor: '#111111',
    paddingVertical: 14,
    paddingHorizontal: 36,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webContent: {
    maxWidth: 900,
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  instructionsPanel: {
    flex: 1,
    padding: 40,
    justifyContent: 'center',
  },
  webBrand: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 4,
    color: '#38bdf8',
    marginBottom: 8,
  },
  webTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  webSubTitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#38bdf8',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f1f5f9',
  },
  stepDesc: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: '#0f172a',
    color: '#38bdf8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
  },
  boldText: {
    fontWeight: '700',
    color: '#ffffff',
  },
  phoneFrameContainer: {
    padding: 40,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneFrame: {
    width: 280,
    height: 560,
    borderRadius: 40,
    backgroundColor: '#000000',
    padding: 10,
    borderWidth: 4,
    borderColor: '#475569',
  },
  phoneDynamicIsland: {
    width: 90,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    position: 'absolute',
    top: 15,
    alignSelf: 'center',
    zIndex: 20,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    overflow: 'hidden',
  },
  phoneStatusBar: {
    height: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
  },
  statusTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  statusIcons: {
    flexDirection: 'row',
  },
  statusIcon: {
    fontSize: 10,
    marginLeft: 4,
  },
  addressBar: {
    height: 28,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 10,
    color: '#64748b',
  },
  mockAppContent: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
  },
  mockAppBrand: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
    color: '#0f172a',
    textAlign: 'center',
    marginTop: 4,
  },
  mockNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 6,
  },
  mockNavItemActive: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
    borderBottomWidth: 2,
    borderBottomColor: '#0f172a',
    paddingBottom: 2,
  },
  mockNavItem: {
    fontSize: 11,
    color: '#64748b',
  },
  mockHeroBanner: {
    height: 80,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  mockHeroTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
  },
  mockHeroSub: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 2,
  },
  mockWarningCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  mockWarningTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 4,
  },
  mockWarningText: {
    fontSize: 9,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 12,
  },
  mockWarningTextSmall: {
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 11,
  },
  mockProductsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mockProduct: {
    width: '48%',
  },
  mockProductImage: {
    height: 70,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    marginBottom: 4,
  },
  mockProductImage2: {
    height: 70,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    marginBottom: 4,
  },
  mockProductTitle: {
    fontSize: 9,
    fontWeight: '600',
    color: '#334155',
  },
  mockProductPrice: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 1,
  },
});
