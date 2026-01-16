import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import api from "../api/axios";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

/* =====================
   VALIDATION SCHEMA
===================== */
const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  dob: Yup.string().required("Date of Birth is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
});

export default function RegisterScreen({ navigation }) {
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const submit = async (values) => {
    try {
      setLoading(true);

      await api.post("/register", {
        name: values.name,
        email: values.email,
        password: values.password,
        dob: values.dob,
      });

      Toast.show({
        type: "success",
        text1: "Registration successful 🎉",
        text2: "Please login to continue",
      });

      navigation.replace("Login");
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Registration failed",
        text2:
          err?.response?.data?.message ||
          "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <Formik
        initialValues={{
          name: "",
          email: "",
          dob: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={RegisterSchema}
        onSubmit={submit}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
        }) => (
          <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>

            {/* NAME */}
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={values.name}
              onChangeText={handleChange("name")}
              onBlur={handleBlur("name")}
            />
            {touched.name && errors.name && (
              <Text style={styles.error}>{errors.name}</Text>
            )}

            {/* EMAIL */}
            <TextInput
              placeholder="Email"
              placeholderTextColor="#aaa"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
            />
            {touched.email && errors.email && (
              <Text style={styles.error}>{errors.email}</Text>
            )}

            {/* DOB */}
            <TouchableOpacity
              style={styles.dobBox}
              onPress={() => setShowDobPicker(true)}
            >
              <Text
                style={
                  values.dob
                    ? styles.dobText
                    : styles.dobPlaceholder
                }
              >
                {values.dob
                  ? new Date(values.dob).toDateString()
                  : "Select Date of Birth"}
              </Text>
              <Ionicons name="calendar" size={22} color="#fff" />
            </TouchableOpacity>
            {touched.dob && errors.dob && (
              <Text style={styles.error}>{errors.dob}</Text>
            )}

            {showDobPicker && (
              <DateTimePicker
                value={
                  values.dob
                    ? new Date(values.dob)
                    : new Date(2005, 0, 1)
                }
                mode="date"
                maximumDate={new Date()}
                display="spinner"
                onChange={(event, selectedDate) => {
                  setShowDobPicker(false);
                  if (selectedDate) {
                    setFieldValue(
                      "dob",
                      selectedDate.toISOString().split("T")[0]
                    );
                  }
                }}
              />
            )}

            {/* PASSWORD */}
            <View style={styles.passwordBox}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#aaa"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
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
              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
              >
                <Ionicons
                  name={showConfirm ? "eye-off" : "eye"}
                  size={22}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
            {touched.confirmPassword &&
              errors.confirmPassword && (
                <Text style={styles.error}>
                  {errors.confirmPassword}
                </Text>
              )}

            {/* SUBMIT */}
            <TouchableOpacity
              style={[styles.button, loading && styles.disabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Creating..." : "REGISTER"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.link}>
                Already have an account? Login
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
    backgroundColor: "#e53935",
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  disabled: { opacity: 0.7 },
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
  dobBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 8,
    padding: 14,
    marginBottom: 4,
  },
  dobPlaceholder: {
    color: "#aaa",
    fontSize: 16,
  },
  dobText: {
    color: "#fff",
    fontSize: 16,
  },
});
