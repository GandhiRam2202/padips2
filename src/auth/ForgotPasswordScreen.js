import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import api from "../api/axios";
import Toast from "react-native-toast-message";

/* =====================
   VALIDATION SCHEMA
===================== */
const ForgotSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

export default function ForgotPasswordScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const sendOtp = async (values) => {
    try {
      setLoading(true);

      const res = await api.post("/auth/forgot-password", {
        email: values.email,
      });

      Toast.show({
        type: "success",
        text1: "OTP sent to your email 📩",
      });

      navigation.navigate("ResetPassword", {
        email: values.email,
        otpExpiresAt: res.data.otpExpiresAt, // 🔥 backend timer
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1:
          err?.response?.data?.message ||
          "Failed to send OTP",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <Formik
        initialValues={{ email: "" }}
        validationSchema={ForgotSchema}
        onSubmit={sendOtp}
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
            <Text style={styles.title}>Forgot Password</Text>

            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="#aaa"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
            />

            {touched.email && errors.email && (
              <Text style={styles.error}>{errors.email}</Text>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.disabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Sending..." : "SEND OTP"}
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
    marginBottom: 25,
  },
  input: {
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: "#fff",
    marginBottom: 6,
  },
  error: {
    color: "#ff5252",
    marginBottom: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: "#e53935",
    padding: 16,
    borderRadius: 8,
  },
  disabled: { opacity: 0.7 },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
