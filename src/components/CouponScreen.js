import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  Clipboard,
  ScrollView,
} from "react-native";

import { styles } from "../styles/styles";

const heroImage = require("../../assets/coupon-hero-new.jpg");
const bagImage = require("../../assets/coupon-bag.png");
const storeImage = require("../../assets/coupon-store.png");

/**
 * Minimal line-art shopping cart icon matching the design mockup.
 */
function CartIcon() {
  return (
    <View style={{ width: 22, height: 22, justifyContent: "center" }}>
      <View
        style={{
          width: 17,
          height: 11,
          borderWidth: 1.8,
          borderColor: "#111111",
          borderTopWidth: 0,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
          marginLeft: 4,
          marginBottom: 2,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          width: 13,
          justifyContent: "space-between",
          marginLeft: 6,
        }}
      >
        <View
          style={{
            width: 3.5,
            height: 3.5,
            borderRadius: 2,
            backgroundColor: "#111111",
          }}
        />
        <View
          style={{
            width: 3.5,
            height: 3.5,
            borderRadius: 2,
            backgroundColor: "#111111",
          }}
        />
      </View>
      <View
        style={{
          position: "absolute",
          top: 3.5,
          left: 1,
          width: 4.5,
          height: 1.8,
          backgroundColor: "#111111",
        }}
      />
    </View>
  );
}

/**
 * Minimal line-art store / shopfront icon matching the design mockup.
 */
function StoreIcon() {
  return (
    <View
      style={{
        width: 22,
        height: 22,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 18,
          height: 6,
          backgroundColor: "#111111",
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
        }}
      />
      <View
        style={{
          width: 16,
          height: 10,
          borderWidth: 1.8,
          borderColor: "#111111",
          borderTopWidth: 0,
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            width: 5,
            height: 6,
            borderWidth: 1.5,
            borderColor: "#111111",
            borderBottomWidth: 0,
          }}
        />
      </View>
    </View>
  );
}

/**
 * Minimal copy icon (two overlapping rectangles).
 */
function CopyIcon() {
  return (
    <View style={{ width: 18, height: 18, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 12,
          height: 12,
          borderWidth: 1.6,
          borderColor: "#111111",
          borderRadius: 2.5,
          backgroundColor: "#fff9f4",
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 12,
          height: 12,
          borderWidth: 1.6,
          borderColor: "#111111",
          borderRadius: 2.5,
          backgroundColor: "#fff9f4",
        }}
      />
    </View>
  );
}

/**
 * 3 accent spark tick marks for ticket decoration.
 */
function SparkTicks() {
  return (
    <View
      style={{
        position: "absolute",
        top: -6,
        right: -8,
        width: 22,
        height: 22,
      }}
    >
      <View
        style={{
          position: "absolute",
          width: 6,
          height: 2,
          backgroundColor: "#fdf4eb",
          transform: [{ rotate: "-40deg" }],
          top: 2,
          right: 9,
          borderRadius: 1,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 7,
          height: 2,
          backgroundColor: "#fdf4eb",
          transform: [{ rotate: "-10deg" }],
          top: 7,
          right: 2,
          borderRadius: 1,
        }}
      />
      <View
        style={{
          position: "absolute",
          width: 6,
          height: 2,
          backgroundColor: "#fdf4eb",
          transform: [{ rotate: "25deg" }],
          top: 14,
          right: 4,
          borderRadius: 1,
        }}
      />
    </View>
  );
}

/**
 * Crisp vertical barcode generator for in-store redemption.
 */
function BarcodeGraphic() {
  const bars = [
    3, 1, 1, 2, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 1, 3, 2, 1, 3, 1, 2, 4, 1,
    2, 1, 3, 1, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 1, 3, 2, 1, 4, 1, 2,
    1, 3, 2, 1, 4, 1, 1, 3, 2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 1, 4, 2, 1, 3, 2,
  ];

  return (
    <View style={styles.barcodeRow}>
      {bars.map((width, idx) => (
        <View
          key={idx}
          style={{
            width,
            height: 70,
            backgroundColor: idx % 2 === 0 ? "#111111" : "#ffffff",
          }}
        />
      ))}
    </View>
  );
}

/**
 * 3-Screen Coupon Flow:
 * 1. "select" - Welcome screen with hero photo, ₹300 OFF ticket, and Use Online / Use Offline options
 * 2. "online" - Online offer ready with shopping bag illustration, APPFIRST300 code, and Shop Now CTA
 * 3. "offline" - In-store offer ready with storefront illustration, barcode, and store code
 */
export function CouponScreen({ onComplete, onStepChange }) {
  const [step, setStep] = useState("select"); // "select" | "online" | "offline"
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  const ONLINE_CODE = "APPFIRST300";
  const STORE_CODE = "ST842791";

  const handleStepChange = (newStep) => {
    setStep(newStep);
    setCopied(false);
    if (onStepChange) {
      onStepChange(newStep);
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleCopyCode = (code = ONLINE_CODE) => {
    try {
      Clipboard.setString(code);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // safe fallback
    }
  };

  const handleShopNow = () => {
    try {
      Clipboard.setString(ONLINE_CODE);
    } catch {}
    if (onComplete) {
      onComplete();
    }
  };

  const handleContinueApp = () => {
    try {
      Clipboard.setString(STORE_CODE);
    } catch {}
    if (onComplete) {
      onComplete();
    }
  };

  // ----------------------------------------------------
  // Screen 1: Welcome & Mode Selection
  // ----------------------------------------------------
  if (step === "select") {
    return (
      <View style={styles.couponSelectContainer}>
        {/* Hero couple image background */}
        <Image source={heroImage} style={styles.couponHeroImage} />
        <View style={styles.couponHeroOverlay} />

        <View style={styles.couponSelectContent}>
          {/* Header: OCTAVE logo */}
          <View style={styles.couponBrandHeader}>
            <Text style={styles.couponBrandTextWhite}>OCTAVE®</Text>
          </View>

          {/* Welcome Text & Ticket */}
          <View style={styles.couponWelcomeBlock}>
            <Text style={styles.welcomeTitle}>Welcome to Octave!</Text>
            <Text style={styles.welcomeSubtitle}>
              As a new app user, you're eligible for
            </Text>

            {/* Ticket Card with Notches */}
            <View style={styles.ticketWrapper}>
              <View style={styles.ticketBody}>
                {/* Side notches */}
                <View style={styles.ticketNotchLeft} />
                <View style={styles.ticketNotchRight} />

                {/* Accent spark marks */}
                <SparkTicks />

                <Text style={styles.ticketAmount}>₹300 OFF</Text>
                <Text style={styles.ticketDesc}>
                  on your next purchase / bill
                </Text>
              </View>
            </View>

            <Text style={styles.questionText}>
              How would you like to use your offer?
            </Text>
          </View>

          {/* Selection Cards */}
          <View style={styles.optionCardsContainer}>
            {/* Card 1: Use Online */}
            <Pressable
              style={styles.optionCard}
              onPress={() => handleStepChange("online")}
            >
              <View style={styles.optionIconCircle}>
                <CartIcon />
              </View>
              <View style={styles.optionTextCol}>
                <Text style={styles.optionTitle}>Use Online</Text>
                <Text style={styles.optionSubtitle}>
                  Shop now on the app or website
                </Text>
              </View>
              <Text style={styles.optionChevron}>›</Text>
            </Pressable>

            {/* Card 2: Use Offline */}
            <Pressable
              style={styles.optionCard}
              onPress={() => handleStepChange("offline")}
            >
              <View style={styles.optionIconCircle}>
                <StoreIcon />
              </View>
              <View style={styles.optionTextCol}>
                <Text style={styles.optionTitle}>Use Offline</Text>
                <Text style={styles.optionSubtitle}>
                  Show a code at any Octave store
                </Text>
              </View>
              <Text style={styles.optionChevron}>›</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // ----------------------------------------------------
  // Screen 2: Online Offer Ready
  // ----------------------------------------------------
  if (step === "online") {
    return (
      <View style={styles.detailContainer}>
        {/* Top Header Bar with Back Button */}
        <View style={styles.detailHeaderBar}>
          <Pressable
            style={styles.detailBackButton}
            onPress={() => handleStepChange("select")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.detailBackButtonText}>‹</Text>
          </Pressable>
          <Text style={styles.couponBrandTextDark}>OCTAVE®</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {/* Shopping Bag Illustration */}
          <View style={styles.detailIllustrationContainer}>
            <Image
              source={bagImage}
              style={styles.detailIllustrationImage}
            />
          </View>

          {/* Heading */}
          <Text style={styles.detailHeading}>Your Online Offer is Ready!</Text>

          {/* Subtitle with highlighted badge */}
          <Text style={styles.detailSubtitleRow}>
            Use the code below at checkout to get{" "}
            <Text style={styles.highlightBadge}>₹300 OFF</Text> on your next
            purchase.
          </Text>

          {/* Dashed Code Card */}
          <Pressable
            style={styles.dashedCodeBox}
            onPress={() => handleCopyCode(ONLINE_CODE)}
          >
            <Text style={styles.dashedCodeText}>{ONLINE_CODE}</Text>
            <CopyIcon />
          </Pressable>

          {copied && (
            <Text style={styles.copiedToast}>
              Coupon code copied to clipboard!
            </Text>
          )}

          {/* CTA: Copy Code & Shop Now */}
          <Pressable style={styles.ctaButton} onPress={handleShopNow}>
            <Text style={styles.ctaButtonText}>Copy Code & Shop Now →</Text>
          </Pressable>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Offer Details */}
          <View style={styles.offerDetailsHeader}>
            <View style={styles.infoIconBadge}>
              <Text style={styles.infoIconText}>i</Text>
            </View>
            <Text style={styles.offerDetailsTitle}>Offer Details</Text>
          </View>
          <Text style={styles.offerBullet}>
            • ₹300 off on your next purchase.
          </Text>
          <Text style={styles.offerBullet}>
            • Applicable on the app and website.
          </Text>
          <Text style={styles.offerBullet}>• Valid for a limited time.</Text>
        </ScrollView>
      </View>
    );
  }

  // ----------------------------------------------------
  // Screen 3: In-Store Offer Ready
  // ----------------------------------------------------
  return (
    <View style={styles.detailContainer}>
      {/* Top Header Bar with Back Button */}
      <View style={styles.detailHeaderBar}>
        <Pressable
          style={styles.detailBackButton}
          onPress={() => handleStepChange("select")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.detailBackButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.couponBrandTextDark}>OCTAVE®</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {/* Storefront Illustration */}
        <View style={styles.detailIllustrationContainer}>
          <Image
            source={storeImage}
            style={styles.detailIllustrationImage}
          />
        </View>

        {/* Heading */}
        <Text style={styles.detailHeading}>Your In-Store Offer is Ready!</Text>

        {/* Subtitle with highlighted badge */}
        <Text style={styles.detailSubtitleRow}>
          Show this code at the cashier to get{" "}
          <Text style={styles.highlightBadge}>₹300 OFF</Text> on your next
          bill.
        </Text>

        {/* Barcode Card - Tap to copy code same as online */}
        <Pressable
          style={styles.barcodeCard}
          onPress={() => handleCopyCode(STORE_CODE)}
        >
          <BarcodeGraphic />
          <View style={styles.barcodeCodeRow}>
            <Text style={styles.barcodeNumber}>{STORE_CODE}</Text>
            <View style={styles.barcodeCopyIcon}>
              <CopyIcon />
            </View>
          </View>
        </Pressable>

        {copied && (
          <Text style={styles.copiedToast}>
            Coupon code copied to clipboard!
          </Text>
        )}

        {/* Store Instructions */}
        <Text style={styles.storePresentText}>
          Present this code at any Octave store.
        </Text>

        {/* CTA: Copy Code & Shop Now (Same as online) */}
        <Pressable style={styles.ctaButton} onPress={handleContinueApp}>
          <Text style={styles.ctaButtonText}>
            Copy Code & Shop Now →
          </Text>
        </Pressable>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Offer Details */}
        <View style={styles.offerDetailsHeader}>
          <View style={styles.infoIconBadge}>
            <Text style={styles.infoIconText}>i</Text>
          </View>
          <Text style={styles.offerDetailsTitle}>Offer Details</Text>
        </View>
        <Text style={styles.offerBullet}>• ₹300 off on your next purchase.</Text>
        <Text style={styles.offerBullet}>
          • Valid only at Octave retail stores.
        </Text>
        <Text style={styles.offerBullet}>• Valid for a limited time.</Text>
      </ScrollView>
    </View>
  );
}
