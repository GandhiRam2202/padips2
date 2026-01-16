import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
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

        if (!res.data?.success) {
          throw new Error("Failed");
        }

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
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!questions.length) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>No questions found</Text>
      </View>
    );
  }

  const q = questions[index];

  return (
    <View style={styles.container}>
      <Text style={styles.count}>
        Test {test} — Q {index + 1} / {questions.length}
      </Text>

      <Text style={styles.question}>{q.question}</Text>

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
            <Text style={styles.optionText}>
              {i + 1}. {opt}
            </Text>
          </View>
        );
      })}

      <Text style={styles.explanation}>Explanation</Text>
      <Text style={styles.question}>{q.explanation}</Text>

      <View style={styles.navRow}>
        <TouchableOpacity
          disabled={index === 0}
          onPress={() => setIndex(index - 1)}
          style={[styles.navBtn, index === 0 && styles.disabled]}
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
    </View>
  );
}

/* =====================
        STYLES
===================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  center: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  count: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 10,
  },
  question: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  explanation: {
    color: "#ff0000ff",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
  },
  option: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#555",
    marginBottom: 12,
  },
  correct: {
    backgroundColor: "#1b8f2a",
    borderColor: "#1b8f2a",
  },
  optionText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  navBtn: {
    backgroundColor: "#ff0000",
    padding: 14,
    borderRadius: 8,
    width: "45%",
  },
  navText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  disabled: {
    opacity: 0.4,
  },
});
