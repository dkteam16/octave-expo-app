import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { styles } from "../styles/styles";

export function OfflineScreen({ onRetry }) {
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