import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import { styles } from "../styles/styles";

export function WebPreviewSite() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;

  return (
    <View style={styles.webContainer}>
      <View
        style={[
          styles.webContent,
          { flexDirection: isLargeScreen ? "row" : "column" },
        ]}
      >
        <View style={styles.instructionsPanel}>
          <Text style={styles.webBrand}>OCTAVE</Text>
          <Text style={styles.webTitle}>Mobile App Wrapper</Text>
          <Text style={styles.webSubTitle}>Web Preview Mode</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🔒 Shopify Frame Protection</Text>
            <Text style={styles.infoText}>
              Shopify storefronts enforce{" "}
              <Text style={styles.codeText}>X-Frame-Options: DENY</Text> to
              protect users from clickjacking. Because of this, web browsers
              block live Shopify stores from loading inside an iframe (web
              webview).
            </Text>
          </View>

          <Text style={styles.sectionTitle}>How to test the Live App:</Text>

          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Start the development server</Text>
              <Text style={styles.stepDesc}>
                Run <Text style={styles.codeText}>npm run android</Text> or{" "}
                <Text style={styles.codeText}>npm run ios</Text> in your
                terminal.
              </Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Open the Mobile Emulator</Text>
              <Text style={styles.stepDesc}>
                Press <Text style={styles.codeText}>a</Text> to open Android
                Emulator, or <Text style={styles.codeText}>i</Text> to open iOS
                Simulator.
              </Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Test on your Physical Phone</Text>
              <Text style={styles.stepDesc}>
                Install the <Text style={styles.boldText}>Expo Go</Text> app,
                and scan the QR code displayed in the terminal.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.phoneFrameContainer}>
          <View style={styles.phoneFrame}>
            <View style={styles.phoneDynamicIsland} />
            <View style={styles.phoneScreen}>
              <View style={styles.phoneStatusBar}>
                <Text style={styles.statusTime}>09:41</Text>
                <View style={styles.statusIcons}>
                  <Text style={styles.statusIcon}>📶</Text>
                  <Text style={styles.statusIcon}>🔋</Text>
                </View>
              </View>
              <View style={styles.addressBar}>
                <Text style={styles.addressText}>🔒 octave.co.in</Text>
              </View>
              <View style={styles.mockAppContent}>
                <Text style={styles.mockAppBrand}>OCTAVE</Text>
                <View style={styles.mockNav}>
                  <Text style={styles.mockNavItemActive}>Men</Text>
                  <Text style={styles.mockNavItem}>Women</Text>
                  <Text style={styles.mockNavItem}>Kids</Text>
                  <Text style={styles.mockNavItem}>Sale</Text>
                </View>
                <View style={styles.mockHeroBanner}>
                  <Text style={styles.mockHeroTitle}>METTLE</Text>
                  <Text style={styles.mockHeroSub}>New Arrivals '26</Text>
                </View>
                <View style={styles.mockWarningCard}>
                  <Text style={styles.mockWarningTitle}>
                    Native Wrapper Ready
                  </Text>
                  <Text style={styles.mockWarningText}>
                    The Shopify wrapper is configured and fully ready for
                    Android & iOS!
                  </Text>
                  <Text style={styles.mockWarningTextSmall}>
                    To load the live storefront, run this project on a mobile
                    simulator or device.
                  </Text>
                </View>
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