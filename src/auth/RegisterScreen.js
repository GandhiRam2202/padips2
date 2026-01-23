import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
        text2: err?.response?.data?.message || "Please try again",
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
                  <View>
                    {/* ILLUSTRATION */}
                    <Image
                      source={require("../../assets/image3.png")}
                      style={styles.image}
                      resizeMode="contain"
                    />

                    {/* NAME */}
                    <View style={styles.inputBox}>
                      <Ionicons name="person-outline" size={22} color="#6b7cff" />
                      <TextInput
                        placeholder="Full Name"
                        placeholderTextColor="#999"
                        style={styles.input}
                        value={values.name}
                        onChangeText={handleChange("name")}
                        onBlur={handleBlur("name")}
                      />
                    </View>
                    {touched.name && errors.name && (
                      <Text style={styles.error}>{errors.name}</Text>
                    )}

                    {/* EMAIL */}
                    <View style={styles.inputBox}>
                      <Ionicons name="mail-outline" size={22} color="#6b7cff" />
                      <TextInput
                        placeholder="Email"
                        placeholderTextColor="#999"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={styles.input}
                        value={values.email}
                        onChangeText={handleChange("email")}
                        onBlur={handleBlur("email")}
                      />
                    </View>
                    {touched.email && errors.email && (
                      <Text style={styles.error}>{errors.email}</Text>
                    )}

                    {/* DOB */}
                    <TouchableOpacity
                      style={styles.inputBox}
                      onPress={() => setShowDobPicker(true)}
                    >
                      <Ionicons name="calendar-outline" size={22} color="#6b7cff" />
                      <Text
                        style={[
                          styles.input,
                          { color: values.dob ? "#000" : "#999" },
                        ]}
                      >
                        {values.dob
                          ? new Date(values.dob).toDateString()
                          : "Date of Birth"}
                      </Text>
                    </TouchableOpacity>
                    {touched.dob && errors.dob && (
                      <Text style={styles.error}>{errors.dob}</Text>
                    )}

                    {showDobPicker && (
                      <DateTimePicker
                        value={
                          values.dob ? new Date(values.dob) : new Date(2005, 0, 1)
                        }
                        mode="date"
                        maximumDate={new Date()}
                        display={Platform.OS === "ios" ? "inline" : "default"}
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
                    <View style={styles.inputBox}>
                      <Ionicons name="lock-closed-outline" size={22} color="#6b7cff" />
                      <TextInput
                        placeholder="Password"
                        placeholderTextColor="#999"
                        secureTextEntry={!showPassword}
                        style={styles.input}
                        value={values.password}
                        onChangeText={handleChange("password")}
                        onBlur={handleBlur("password")}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
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
                      <TouchableOpacity
                        onPress={() => setShowConfirm(!showConfirm)}
                      >
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

                    {/* SUBMIT */}
                    <TouchableOpacity
                      style={[styles.button, loading && styles.disabled]}
                      onPress={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>Register</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.goBack()}>
                      <Text style={styles.link}>
                        Already have an account? Login
                      </Text>
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
    justifyContent: 'center'
  },
  image: {
    width: "100%",
    height: 180, // Reduced slightly to accommodate the longer form
    marginBottom: 10,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f6ff",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
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
  link: {
    color: "#4f7cff",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 30, // Added padding so it's not hidden behind navigation bars
    fontSize: 16,
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.6,
  },
});