import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import * as Yup from "yup";
import api from "../api/axios";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

/* =====================
   VALIDATION SCHEMA
===================== */
const ResetSchema = Yup.object().shape({
  otp: Yup.string()
    .length(6, "OTP must be 6 digits")
    .required("OTP is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
});

export default function ResetPasswordScreen({ route, navigation }) {
  const { email, otpExpiresAt: rawOtpExpiresAt } = route.params;

  const initialOtpExpiresAt = rawOtpExpiresAt
    ? new Date(rawOtpExpiresAt).getTime()
    : 0;

  const [otpExpiresAt, setOtpExpiresAt] = useState(initialOtpExpiresAt);
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!initialOtpExpiresAt) return 0;
    const diff = Math.floor((initialOtpExpiresAt - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  });

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  /* =====================
     BACKEND DRIVEN TIMER
  ====================== */
  useEffect(() => {
    if (!otpExpiresAt) return;

    const tick = () => {
      const diff = Math.floor((otpExpiresAt - Date.now()) / 1000);
      setSecondsLeft(diff > 0 ? diff : 0);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [otpExpiresAt]);

  /* =====================
     RESET PASSWORD
  ====================== */
  const resetPassword = async (values) => {
    try {
      setResetLoading(true);
      await api.post("/reset-password", {
        email,
        otp: values.otp,
        password: values.password,
      });

      Toast.show({
        type: "success",
        text1: "Password reset successful ✅",
      });

      navigation.replace("Login");
    } catch (err) {
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message || "Invalid or expired OTP",
      });
    } finally {
      setResetLoading(false);
    }
  };

  /* =====================
     RESEND OTP
  ====================== */
  const resendOtp = async () => {
    try {
      setResendLoading(true);
      const res = await api.post("/forgot-password", { email });

      Toast.show({
        type: "success",
        text1: "OTP resent successfully 📩",
      });

      setOtpExpiresAt(new Date(res.data.otpExpiresAt).getTime());
    } catch (err) {
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message || "Please wait before resending",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              <Formik
                initialValues={{
                  otp: "",
                  password: "",
                  confirmPassword: "",
                }}
                validationSchema={ResetSchema}
                onSubmit={resetPassword}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                }) => (
                  <View>
                    {/* ILLUSTRATION */}
                    <Image
                      source={require("../../assets/image2.png")}
                      style={styles.image}
                      resizeMode="contain"
                    />

                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.emailText}>{email}</Text>

                    {/* OTP */}
                    <View style={styles.inputBox}>
                      <Ionicons name="key-outline" size={22} color="#6b7cff" />
                      <TextInput
                        placeholder="Enter OTP"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        maxLength={6}
                        style={styles.input}
                        value={values.otp}
                        onChangeText={handleChange("otp")}
                        onBlur={handleBlur("otp")}
                      />
                    </View>
                    {touched.otp && errors.otp && (
                      <Text style={styles.error}>{errors.otp}</Text>
                    )}

                    {/* TIMER / RESEND */}
                    <View style={styles.timerContainer}>
                      {secondsLeft > 0 ? (
                        <Text style={styles.timer}>
                          ⏳ OTP expires in {secondsLeft}s
                        </Text>
                      ) : (
                        <View style={styles.expiredRow}>
                          <Text style={styles.expired}>OTP expired </Text>
                          <TouchableOpacity
                            onPress={resendOtp}
                            disabled={resendLoading}
                          >
                            <Text style={styles.resend}>
                              {resendLoading ? "Resending..." : "Resend OTP"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    {/* NEW PASSWORD */}
                    <View style={styles.inputBox}>
                      <Ionicons name="lock-closed-outline" size={22} color="#6b7cff" />
                      <TextInput
                        placeholder="New Password"
                        placeholderTextColor="#999"
                        secureTextEntry={!showPwd}
                        style={styles.input}
                        value={values.password}
                        onChangeText={handleChange("password")}
                        onBlur={handleBlur("password")}
                      />
                      <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
                        <Ionicons
                          name={showPwd ? "eye-off-outline" : "eye-outline"}
                          size={22}
                          color="#999"
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.password && errors.password && (
                      <Text style={styles.error}>{errors.password}</Text>
                    )}

                    {/* CONFIRM PASSWORD */}
                    <View style={styles.inputBox}>
                      <Ionicons name="lock-open-outline" size={22} color="#6b7cff" />
                      <TextInput
                        placeholder="Confirm Password"
                        placeholderTextColor="#999"
                        secureTextEntry={!showConfirm}
                        style={styles.input}
                        value={values.confirmPassword}
                        onChangeText={handleChange("confirmPassword")}
                        onBlur={handleBlur("confirmPassword")}
                      />
                      <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                        <Ionicons
                          name={showConfirm ? "eye-off-outline" : "eye-outline"}
                          size={22}
                          color="#999"
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <Text style={styles.error}>{errors.confirmPassword}</Text>
                    )}

                    {/* RESET BUTTON */}
                    <TouchableOpacity
                      style={[styles.button, resetLoading && styles.disabled]}
                      onPress={handleSubmit}
                      disabled={resetLoading}
                    >
                      {resetLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>Reset Password</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </Formik>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* =====================
        STYLES
===================== */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: 180,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
  },
  emailText: {
    textAlign: "center",
    color: "#777",
    marginBottom: 20,
    fontSize: 14,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f6ff",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#000",
  },
  error: {
    color: "#ff5252",
    fontSize: 13,
    marginLeft: 15,
    marginBottom: 10,
  },
  timerContainer: {
    height: 30,
    justifyContent: "center",
    marginBottom: 10,
  },
  timer: {
    textAlign: "center",
    color: "#ff9800",
    fontWeight: "600",
  },
  expiredRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  expired: {
    color: "#ff5252",
  },
  resend: {
    color: "#4f7cff",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#4f7cff",
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 20,
    marginBottom: 40,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  disabled: {
    opacity: 0.6,
  },
});