import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  ScrollView,
} from "react-native";
import Toast from "react-native-toast-message";
import api from "../api/axios";
import { getUser } from "../utils/storage";

/* 🔀 SHUFFLE */
const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export default function TestQuestionScreen({ route, navigation }) {
  const { test } = route.params;

  /* ================= STATE ================= */
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const timerRef = useRef(null);

  /* ================= BLOCK BACK ================= */
  useEffect(() => {
    const handler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    return () => handler.remove();
  }, []);

  /* ================= CHECK ATTEMPT ================= */
  const checkAttempt = async () => {
    try {
      const user = await getUser();

      const res = await api.post("/tests/check-attempt", {
        test,
        email: user.email,
      });

      if (res.data?.attempted) {
        setReviewMode(true);
        setSubmitted(true);
        setTimerStarted(false);
        setTimeLeft(0);

        Toast.show({
          type: "info",
          text1: "Review Mode",
          text2: "You already attempted this test",
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Failed to verify test status",
      });
    }
  };

  /* ================= FETCH QUESTIONS ================= */
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      await checkAttempt();

      const res = await api.post("/tests/questions", { test });
      if (!res.data?.success || !Array.isArray(res.data.data)) {
        throw new Error();
      }

      const shuffled = shuffleArray(res.data.data);
      setQuestions(shuffled);

      if (!reviewMode) {
        setTimeLeft(shuffled.length * 60);
        setTimerStarted(true);
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Failed to load questions",
      });
    } finally {
      setLoading(false);
    }
  }, [test, reviewMode]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!timerStarted || reviewMode || submitted || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, timerStarted, reviewMode, submitted]);

  /* ================= AUTO SUBMIT ================= */
  useEffect(() => {
    if (
      timerStarted &&
      !reviewMode &&
      timeLeft === 0 &&
      !submitted &&
      !submitting
    ) {
      submitTest();
    }
  }, [timeLeft, timerStarted, reviewMode]);

  /* ================= SELECT OPTION ================= */
  const selectOption = (index) => {
    if (submitted || reviewMode) return;
    setAnswers((prev) => ({ ...prev, [currentIndex]: index }));
  };

  /* ================= SUBMIT TEST ================= */
  const submitTest = async () => {
    if (submitted || submitting || reviewMode) return;

    try {
      setSubmitting(true);
      clearInterval(timerRef.current);

      let score = 0;
      questions.forEach((q, i) => {
        if (answers[i] === q.correctAnswer) score += 1.5;
      });

      const user = await getUser();

      await api.post("/tests/submit", {
        test,
        score,
        email: user.email,
        name: user.name,
      });

      setSubmitted(true);

      Toast.show({
        type: "success",
        text1: "Test submitted successfully",
      });

      setTimeout(() => {
        navigation.popToTop();
      }, 800);
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= HELPERS ================= */
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

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
        <Text style={styles.empty}>No questions available</Text>
      </View>
    );
  }

  const question = questions[currentIndex];

  /* ================= RENDER ================= */
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!reviewMode && !submitted && (
        <Text style={styles.timer}>
          ⏱ {formatTime(timeLeft)}
        </Text>
      )}

      <Text style={styles.count}>
        Question {currentIndex + 1} of {questions.length}
      </Text>

      {/* QUESTION */}
      <View style={styles.card}>
        <Text style={styles.question}>{question.question}</Text>
      </View>

      {/* OPTIONS */}
      {question.options.map((opt, i) => {
        const selected = answers[currentIndex] === i;
        const correct = i === question.correctAnswer;

        let bg = "#fff";
        let border = "#ddd";
        let color = "#333";

        if (reviewMode || submitted) {
          if (correct) {
            bg = "#e8f8ee";
            border = "#2e7d32";
            color = "#2e7d32";
          } else if (selected) {
            bg = "#f5f5f5";
          }
        } else if (selected) {
          bg = "#f4f6ff";
          border = "#4f7cff";
          color = "#4f7cff";
        }

        return (
          <TouchableOpacity
            key={i}
            style={[
              styles.option,
              { backgroundColor: bg, borderColor: border },
            ]}
            onPress={() => selectOption(i)}
            disabled={submitted || reviewMode}
          >
            <Text style={[styles.optionText, { color }]}>
              {i + 1}. {opt}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* EXPLANATION */}
      {reviewMode && (
        <>
          <Text style={styles.exTitle}>Explanation</Text>
          <View style={styles.exBox}>
            <Text style={styles.exText}>
              {question.explanation}
            </Text>
          </View>
        </>
      )}

      {/* NAVIGATION */}
      <View style={styles.navRow}>
        <TouchableOpacity
          disabled={currentIndex === 0}
          onPress={() => setCurrentIndex((i) => i - 1)}
          style={[
            styles.navBtn,
            currentIndex === 0 && styles.disabled,
          ]}
        >
          <Text style={styles.navText}>Previous</Text>
        </TouchableOpacity>

        {currentIndex < questions.length - 1 ? (
          <TouchableOpacity
            onPress={() => setCurrentIndex((i) => i + 1)}
            style={styles.navBtn}
          >
            <Text style={styles.navText}>Next</Text>
          </TouchableOpacity>
        ) : (
          !submitted &&
          !reviewMode && (
            <TouchableOpacity
              onPress={submitTest}
              style={styles.submitBtn}
            >
              <Text style={styles.submitText}>
                Submit Test
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </ScrollView>
  );
}

/* ================= STYLES ================= */
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
  },
  timer: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff5252",
    marginBottom: 6,
  },
  count: {
    textAlign: "center",
    color: "#666",
    fontWeight: "600",
    marginBottom: 12,
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
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
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
    fontSize: 18,
    color: "#333",
    lineHeight: 22,
    fontWeight:"bold"
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
  submitBtn: {
    backgroundColor: "#2e7d32",
    paddingVertical: 14,
    borderRadius: 30,
    width: "45%",
  },
  navText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  submitText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});
