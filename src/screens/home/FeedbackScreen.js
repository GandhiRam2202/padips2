import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { getUser } from "../../utils/storage";
import api from "../../api/axios";

export default function FeedbackScreen({ navigation }) {
  const [feedback, setFeedback] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  /* =====================
     LOAD USER
  ====================== */
  useEffect(() => {
    const loadUser = async () => {
      const u = await getUser();
      setUser(u);
    };
    loadUser();
  }, []);

  /* =====================
     SUBMIT FEEDBACK
  ====================== */
  const submitFeedback = async () => {
    if (!feedback.trim()) {
      Toast.show({
        type: "error",
        text1: "Feedback Required",
        text2: "Please write your feedback",
      });
      return;
    }

    if (!user) {
      Toast.show({
        type: "error",
        text1: "Session expired",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/feedback", {
        name: user.name,
        email: user.email,
        feedback,
      });

      if (!res.data?.success) {
        throw new Error("Failed");
      }

      Toast.show({
        type: "success",
        text1: "Thank you 🙏",
        text2: "Your feedback has been submitted",
      });

      setFeedback("");

      setTimeout(() => {
        navigation.goBack();
      }, 800);
    } catch {
      Toast.show({
        type: "error",
        text1: "Submission failed",
        text2: "Please try again later",
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
              
              <Image
                source={require("../../../assets/image4.png")}
                style={styles.image}
                resizeMode="contain"
              />


              <View style={styles.card}>
                <TextInput
                  style={styles.feedbackInput}
                  placeholder="Write your feedback here..."
                  placeholderTextColor="#e0e0e0"
                  multiline
                  numberOfLines={6}
                  value={feedback}
                  onChangeText={setFeedback}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  loading && styles.disabledButton,
                ]}
                onPress={submitFeedback}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>
                    Submit Feedback
                  </Text>
                )}
              </TouchableOpacity>
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
    padding: 20,
    justifyContent: "center", // Center content vertically
  },
  image: {
    width: "100%",
    height: 250, // Reduced slightly to accommodate text and button
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
    fontSize: 14,
  },
  card: {
    backgroundColor: "#7e8bc3",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    minHeight: 150, // Ensures consistent look
  },
  feedbackInput: {
    fontWeight: "500",
    fontSize: 16,
    color: "#fff",
    textAlignVertical: "top", // Essential for multiline on Android
    minHeight: 120,
  },
  button: {
    backgroundColor: "#4f7cff",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 20, // Bottom padding for scroll
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
});