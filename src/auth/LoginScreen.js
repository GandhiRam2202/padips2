import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useContext, useState } from "react";
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
  

    // ❌ Invalid response guard
    if (!res?.data?.token || !res?.data?.user) {
      Toast.show({
        type: "error",
        text1: "Invalid login response",
      });
      return; // ✅ IMPORTANT
    }

    // ✅ Success
    Toast.show({
      type: "success",
      text1: "Login successful",
    });

    // 🔥 MUST pass BOTH
    await login(res.data.token, res.data.user);
  
    

  } catch (err) {
    

    Toast.show({
      type: "error",
      text1:
        err?.response?.data?.message ||
        err?.message ||
        "Login failed",
    });
  } finally {
    setLoading(false);
  }
};




  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
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
          <View style={styles.container}>
            <Text style={styles.title}>Login</Text>

            {/* EMAIL */}
            <TextInput
              placeholder="Email"
              placeholderTextColor="#aaa"
              style={styles.input}
              autoCapitalize="none"
              editable={!loading}
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
            />
            {touched.email && errors.email && (
              <Text style={styles.error}>{errors.email}</Text>
            )}

            {/* PASSWORD */}
            <View style={styles.passwordBox}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
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
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password && (
              <Text style={styles.error}>{errors.password}</Text>
            )}

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
                <Text style={styles.buttonText}>LOGIN</Text>
              )}
            </TouchableOpacity>

            {/* LINKS */}
            {!loading && (
              <>
                <TouchableOpacity
                  onPress={() => navigation.navigate("ForgotPassword")}
                >
                  <Text style={styles.link}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate("Register")}
                >
                  <Text style={styles.link}>New user? Register</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </Formik>
    </SafeAreaView>
  );
}

/* =======================
        STYLES
======================= */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
  },
  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 8,
    paddingHorizontal: 14,
    marginBottom: 5,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    paddingVertical: 14,
  },
  error: {
    color: "#ff5252",
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#e53935",
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  link: {
    color: "#4da6ff",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.6,
  },
});
