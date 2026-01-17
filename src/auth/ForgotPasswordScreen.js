import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import api from "../api/axios";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

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

      const res = await api.post("/forgot-password", {
        email: values.email,
      });

      Toast.show({
        type: "success",
        text1: "OTP sent to your email 📩",
      });

      navigation.navigate("ResetPassword", {
        email: values.email,
        otpExpiresAt: res.data.otpExpiresAt,
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
    <SafeAreaView style={styles.safe}>
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

            {/* ILLUSTRATION */}
            <Image
              source={require("../../assets/image1.png")}
              style={styles.image}
              resizeMode="contain"
            />

          
            <Text style={styles.subtitle}>
              Enter your registered email to receive OTP
            </Text>

            {/* EMAIL INPUT */}
            <View style={styles.inputBox}>
              <Ionicons
                name="mail-outline"
                size={22}
                color="#6b7cff"
              />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#999"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
              />
            </View>

            {touched.email && errors.email && (
              <Text style={styles.error}>{errors.email}</Text>
            )}

            {/* BUTTON */}
            <TouchableOpacity
              style={[
                styles.button,
                loading && styles.disabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>

            {/* BACK TO LOGIN */}
            {!loading && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.back}>
                  Back to Login
                </Text>
              </TouchableOpacity>
            )}
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
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingTop:100,
    padding: 24,
  },
  image: {
    width: "100%",
    height: 220,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    marginBottom: 6,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f6ff",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 14,
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
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#4f7cff",
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  back: {
    textAlign: "center",
    marginTop: 25,
    color: "#4f7cff",
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.6,
  },
});
