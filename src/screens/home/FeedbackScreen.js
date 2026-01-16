import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";


import { getUser } from "../../utils/storage";
import api from "../../api/axios";

export default function FeedbackScreen({ navigation }) {
  const [feedback, setFeedback] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  /* =====================
     LOAD USER (PADIPS2)
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

      // 🔙 Go back to previous screen / Home
      setTimeout(() => {
        navigation.goBack();
      }, 800);

    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Submission failed",
        text2: "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =====================
        UI
  ====================== */
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, styles.feedbackInput]}
        placeholder="Write your feedback here..."
        placeholderTextColor="#888"
        multiline
        value={feedback}
        onChangeText={setFeedback}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={submitFeedback}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Submit</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

/* =====================
        STYLES
===================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#000",
  },
  input: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    marginBottom: 15,
    color: "#fff",
    fontWeight: "bold",
  },
  feedbackInput: {
    height: 150,
    textAlignVertical: "top",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#e53935",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
