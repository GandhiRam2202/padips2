import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
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

  // ✅ Safe conversion
  const initialOtpExpiresAt = rawOtpExpiresAt
    ? new Date(rawOtpExpiresAt).getTime()
    : 0;

  const [otpExpiresAt, setOtpExpiresAt] = useState(initialOtpExpiresAt);
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!initialOtpExpiresAt) return 0;
    const diff = Math.floor(
      (initialOtpExpiresAt - Date.now()) / 1000
    );
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
      const diff = Math.floor(
        (otpExpiresAt - Date.now()) / 1000
      );
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
        password: values.password, // ✅ MUST MATCH BACKEND
      });

      Toast.show({
        type: "success",
        text1: "Password reset successful ✅",
      });

      navigation.replace("Login");
    } catch (err) {
      Toast.show({
        type: "error",
        text1:
          err?.response?.data?.message ||
          "Invalid or expired OTP",
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

      setOtpExpiresAt(
        new Date(res.data.otpExpiresAt).getTime()
      );
    } catch (err) {
      Toast.show({
        type: "error",
        text1:
          err?.response?.data?.message ||
          "Please wait before resending",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
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
          <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.emailText}>{email}</Text>

            {/* OTP */}
            <TextInput
              placeholder="Enter OTP"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              maxLength={6}
              style={styles.input}
              value={values.otp}
              onChangeText={handleChange("otp")}
              onBlur={handleBlur("otp")}
            />
            {touched.otp && errors.otp && (
              <Text style={styles.error}>{errors.otp}</Text>
            )}

            {/* TIMER / RESEND */}
            {secondsLeft > 0 ? (
              <Text style={styles.timer}>
                ⏳ OTP expires in {secondsLeft}s
              </Text>
            ) : (
              <>
                <Text style={styles.expired}>
                  OTP expired. Please resend OTP.
                </Text>
                <TouchableOpacity
                  onPress={resendOtp}
                  disabled={resendLoading}
                >
                  <Text style={styles.resend}>
                    {resendLoading ? "Resending..." : "🔁 Resend OTP"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* NEW PASSWORD */}
            <View style={styles.passwordBox}>
              <TextInput
                placeholder="New Password"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPwd}
                style={styles.passwordInput}
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
              />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
                <Ionicons
                  name={showPwd ? "eye-off" : "eye"}
                  size={22}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password && (
              <Text style={styles.error}>{errors.password}</Text>
            )}

            {/* CONFIRM PASSWORD */}
            <View style={styles.passwordBox}>
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#aaa"
                secureTextEntry={!showConfirm}
                style={styles.passwordInput}
                value={values.confirmPassword}
                onChangeText={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Ionicons
                  name={showConfirm ? "eye-off" : "eye"}
                  size={22}
                  color="#fff"
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
              <Text style={styles.buttonText}>
                {resetLoading ? "Resetting..." : "RESET PASSWORD"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </SafeAreaView>
  );
}

/* =====================
        STYLES
===================== */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000" },
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  emailText: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 10,
  },
  timer: {
    color: "#ffa726",
    textAlign: "center",
    marginBottom: 10,
  },
  expired: {
    color: "#ff5252",
    textAlign: "center",
    marginBottom: 6,
  },
  resend: {
    color: "#4da6ff",
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: "#fff",
    marginBottom: 4,
  },
  error: {
    color: "#ff5252",
    fontSize: 14,
    marginBottom: 10,
  },
  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 8,
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    paddingVertical: 14,
  },
  button: {
    backgroundColor: "#1b8f2a",
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  disabled: { opacity: 0.6 },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
