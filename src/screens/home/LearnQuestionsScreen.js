import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import api from "../../api/axios";

const { width } = Dimensions.get("window");

export default function LearnQuestionsScreen({ route }) {
  const { test } = route.params;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH QUESTIONS ================= */
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

  /* ================= UI STATES ================= */
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
        <Text>No questions found</Text>
      </View>
    );
  }

  /* ================= RENDER ================= */
  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={(e) => {
        const page = Math.round(
          e.nativeEvent.contentOffset.x / width
        );
        setCurrentIndex(page);
      }}
    >
      {questions.map((q, qIndex) => (
        <View key={q._id || qIndex} style={styles.page}>
          {/* HEADER */}
          <Text style={styles.count}>
            Test {test} • Question {qIndex + 1} / {questions.length}
          </Text>

          <Text style={styles.swipeHint}>
            ⬅ Swipe right • Swipe left ➡
          </Text>

          {/* ===== TAMIL QUESTION ===== */}
          <View style={styles.card}>
            <Text style={styles.question}>{q.question.tamil}</Text>

            {q.options.map((opt, i) => {
              const isCorrect = i === q.correctAnswer;

              return (
                <View
                  key={`ta-${i}`}
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
                    {i + 1}. {opt.tamil}
                  </Text>
                </View>
              );
            })}

            {/* Tamil Explanation */}
            <View style={styles.exBox}>
              <Text style={styles.exTitle}>விளக்கம்</Text>
              <Text style={styles.exText}>
                {q.explanation?.tamil || "—"}
              </Text>
            </View>
          </View>

          {/* ===== ENGLISH QUESTION ===== */}
          <View style={styles.card}>
            <Text style={styles.question}>{q.question.english}</Text>

            {q.options.map((opt, i) => {
              const isCorrect = i === q.correctAnswer;

              return (
                <View
                  key={`en-${i}`}
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
                    {i + 1}. {opt.english}
                  </Text>
                </View>
              );
            })}

            {/* English Explanation */}
            <View style={styles.exBox}>
              <Text style={styles.exTitle}>Explanation</Text>
              <Text style={styles.exText}>
                {q.explanation?.english || "—"}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

/* =====================
        STYLES
===================== */
const styles = StyleSheet.create({
  page: {
    width,
    padding: 20,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  count: {
    textAlign: "center",
    marginBottom: 6,
    color: "#666",
    fontWeight: "600",
  },
  swipeHint: {
    textAlign: "center",
    fontSize: 13,
    color: "#999",
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#f4f6ff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#000",
  },
  option: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  exBox: {
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  exTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#4f7cff",
  },
  exText: {
    fontSize: 14,
    color: "#333",
  },
  correct: {
    backgroundColor: "#e8f8ee",
    borderColor: "#2e7d32",
  },
  correctText: {
    color: "#2e7d32",
    fontWeight: "bold",
  },
});
