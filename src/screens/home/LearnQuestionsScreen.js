import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import api from "../../api/axios";

export default function LearnQuestionsScreen({ route }) {
  const { test } = route.params;

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  /* =====================
     FETCH QUESTIONS
  ====================== */
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.post("/tests/questions", { test });
        if (!res.data?.success) throw new Error();
        setQuestions(res.data.data);
      } catch {
        alert("Failed to load questions");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [test]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f7cff" />
      </View>
    );
  }

  if (!questions.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No questions found</Text>
      </View>
    );
  }

  const q = questions[index];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <Text style={styles.count}>
        Test {test} • Question {index + 1} of {questions.length}
      </Text>

      {/* QUESTION CARD */}
      <View style={styles.card}>
        <Text style={styles.question}>{q.question}</Text>
      </View>

      {/* OPTIONS */}
      {q.options.map((opt, i) => {
        const isCorrect = i === q.correctAnswer;

        return (
          <View
            key={i}
            style={[
              styles.option,
              isCorrect && styles.correct,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                isCorrect && styles.correctText,
              ]}
            >
              {i + 1}. {opt}
            </Text>
          </View>
        );
      })}

      {/* EXPLANATION */}
      <Text style={styles.exTitle}>Explanation</Text>
      <View style={styles.exBox}>
        <Text style={styles.exText}>{q.explanation}</Text>
      </View>

      {/* NAVIGATION */}
      <View style={styles.navRow}>
        <TouchableOpacity
          disabled={index === 0}
          onPress={() => setIndex(index - 1)}
          style={[
            styles.navBtn,
            index === 0 && styles.disabled,
          ]}
        >
          <Text style={styles.navText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={index === questions.length - 1}
          onPress={() => setIndex(index + 1)}
          style={[
            styles.navBtn,
            index === questions.length - 1 && styles.disabled,
          ]}
        >
          <Text style={styles.navText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* =====================
        STYLES
===================== */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    color: "#777",
    fontSize: 16,
  },
  count: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#f4f6ff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
  },
  question: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  option: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
  },
  correct: {
    backgroundColor: "#e8f8ee",
    borderColor: "#2e7d32",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  correctText: {
    color: "#2e7d32",
  },
  exTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4f7cff",
    marginTop: 20,
    marginBottom: 6,
  },
  exBox: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 14,
  },
  exText: {
    color: "#333",
    fontSize: 16,
    lineHeight: 22,
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 30,
  },
  navBtn: {
    backgroundColor: "#4f7cff",
    paddingVertical: 14,
    borderRadius: 30,
    width: "45%",
  },
  navText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});
