import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
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

  /* =====================
        UI
  ====================== */
  return (
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
          placeholderTextColor="#ffffffff"
          multiline
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
  );
}

/* =====================
        STYLES
===================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginTop: 10,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#7e8bc3ff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  feedbackInput: {
    fontWeight: "bold",
    height: 150,
    fontSize: 16,
    color: "#ffffffff",
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#4f7cff",
    paddingVertical: 16,
    borderRadius: 30,
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
    image: {
    width: "100%",
    height: 320,
    marginBottom: 10,
  },
});
