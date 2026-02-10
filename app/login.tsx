import { router } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { supabase } from "./supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * 🔐 Biometric / PIN Authentication
   */
  const verifyDeviceSecurity = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "Security Required",
          "Please enable fingerprint, face ID, or device PIN to continue.",
        );
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Verify to access Neatify Staff",
        fallbackLabel: "Use Device PIN",
        cancelLabel: "Cancel",
      });

      return result.success;
    } catch (error) {
      return false;
    }
  };

  /**
   * 🔑 Login Handler
   */
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password required");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 👉 After successful login → verify biometric / PIN
      const verified = await verifyDeviceSecurity();

      if (!verified) {
        await supabase.auth.signOut();
        Alert.alert(
          "Verification Failed",
          "Security verification is required to continue.",
        );
        return;
      }

      // ✅ All good → go to next page
      router.replace("./my-role");
    } catch (err: any) {
      Alert.alert("Login Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.subtitle}>Staff Login</Text>
        </View>

        {/* EMAIL */}
        <View style={styles.inputContainer}>
          <Mail size={20} />
          <TextInput
            placeholder="Email Address"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* PASSWORD */}
        <View style={styles.inputContainer}>
          <Lock size={20} />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            style={styles.input}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff /> : <Eye />}
          </TouchableOpacity>
        </View>

        {/* LOGIN BUTTON */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.primaryBtnText}>Log In</Text>
          )}
        </TouchableOpacity>

        {/* FOOTER */}
        {/* <View style={styles.footer}>
          <Text>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.linkText}> Sign Up</Text>
          </TouchableOpacity>
        </View> */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/**
 * 🎨 Styles
 */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 25,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 300,
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 15,
    marginBottom: 15,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  primaryBtn: {
    backgroundColor: "#FFD700",
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#000",
    fontSize: 17,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  linkText: {
    fontWeight: "800",
  },
});
