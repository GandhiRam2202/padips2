import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
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
import { AuthContext } from "../auth/AuthContext";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

/* =======================
   VALIDATION SCHEMA
======================= */
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =======================
      SUBMIT HANDLER
  ======================= */
  const submit = async (values) => {
    if (loading) return;

    try {
      setLoading(true);
      const res = await api.post("/login", values);

      if (!res?.data?.token || !res?.data?.user) {
        Toast.show({
          type: "error",
          text1: "Invalid login response",
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: "Login successful",
      });

      await login(res.data.token, res.data.user);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: err?.response?.data?.message || err?.message || "Login failed",
      });
    } finally {
      setLoading(false);
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
                initialValues={{ email: "", password: "" }}
                validationSchema={LoginSchema}
                onSubmit={submit}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                  isValid,
                }) => (
                  <View>
                    {/* ILLUSTRATION */}
                    <Image
                      source={require("../../assets/image.png")}
                      style={styles.image}
                      resizeMode="contain"
                    />

                    {/* EMAIL */}
                    <View style={styles.inputBox}>
                      <Ionicons name="mail-outline" size={22} color="#6b7cff" />
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

                    {/* PASSWORD */}
                    <View style={styles.inputBox}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={22}
                        color="#6b7cff"
                      />
                      <TextInput
                        placeholder="Password"
                        placeholderTextColor="#999"
                        secureTextEntry={!showPassword}
                        style={styles.input}
                        editable={!loading}
                        value={values.password}
                        onChangeText={handleChange("password")}
                        onBlur={handleBlur("password")}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
                          size={22}
                          color="#999"
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.password && errors.password && (
                      <Text style={styles.error}>{errors.password}</Text>
                    )}

                    {/* FORGOT PASSWORD */}
                    <TouchableOpacity
                      onPress={() => navigation.navigate("ForgotPassword")}
                    >
                      <Text style={styles.forgot}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* LOGIN BUTTON */}
                    <TouchableOpacity
                      style={[
                        styles.button,
                        (loading || !isValid) && styles.disabled,
                      ]}
                      onPress={handleSubmit}
                      disabled={loading || !isValid}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>Log In</Text>
                      )}
                    </TouchableOpacity>

                    {/* REGISTER */}
                    {!loading && (
                      <TouchableOpacity
                        onPress={() => navigation.navigate("Register")}
                      >
                        <Text style={styles.register}>
                          New user?{" "}
                          <Text style={styles.registerBold}>Register</Text>
                        </Text>
                      </TouchableOpacity>
                    )}
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

/* =======================
        STYLES
======================= */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center", // Keeps the form centered when keyboard is off
  },
  image: {
    width: "100%",
    height: 220, // Slightly reduced to ensure it fits better on small screens
    marginBottom: 20,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f6ff",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === "ios" ? 16 : 10, // Adjust for OS heights
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
  forgot: {
    textAlign: "right",
    color: "#6b7cff",
    marginVertical: 15,
    fontWeight: "500",
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
  register: {
    textAlign: "center",
    marginTop: 25,
    color: "#555",
    paddingBottom: 20, // Extra space at bottom
  },
  registerBold: {
    color: "#4f7cff",
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.6,
  },
});