import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  ScrollView,
  Dimensions,
} from "react-native";
import Toast from "react-native-toast-message";
import api from "../api/axios";
import { getUser } from "../utils/storage";

const { width } = Dimensions.get("window");

/* 🔀 SHUFFLE QUESTIONS */
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
        setTimeLeft(shuffled.length * 90); // 1.5 min per question
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
      timeLeft === 0 &&
      !reviewMode &&
      !submitted
    ) {
      submitTest();
    }
  }, [timeLeft, timerStarted, reviewMode, submitted]);

  /* ================= SUBMIT TEST ================= */
  const submitTest = async () => {
    if (submitted || submitting || reviewMode) return;

    try {
      setSubmitting(true);
      clearInterval(timerRef.current);
      setTimerStarted(false);

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

      setTimeout(() => navigation.popToTop(), 800);
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= FORMAT TIME ================= */
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
        <Text>No questions available</Text>
      </View>
    );
  }

  /* ================= RENDER ================= */
  return (
    <>
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
        {questions.map((question, qIndex) => (
          <View key={question._id} style={styles.page}>
            {!reviewMode && !submitted && (
              <Text style={styles.timer}>
                ⏱ {formatTime(timeLeft)}
              </Text>
            )}

            <Text style={styles.count}>
              Question {qIndex + 1} of {questions.length}
            </Text>

            {/* ===== TAMIL ===== */}
            <View style={styles.card}>
              <Text style={styles.question}>
                {question.question.tamil}
              </Text>

              {question.options.map((opt, i) => {
                const selected = answers[qIndex] === i;
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
                    onPress={() =>
                      !submitted &&
                      !reviewMode &&
                      setAnswers((prev) => ({
                        ...prev,
                        [qIndex]: i,
                      }))
                    }
                  >
                    <Text style={[styles.optionText, { color }]}>
                      {i + 1}. {opt.tamil}
                    </Text>
                  </TouchableOpacity>
                );
              })}
               {/* ===== TAMIL EXPLANATION ===== */ }
                {
                  (reviewMode || submitted) && (
                    <>
                      <Text style={styles.exTitle}>விளக்கம்</Text>
                      <View style={styles.exBox}>
                        <Text style={styles.exText}>
                          {question.explanation?.tamil || "—"}
                        </Text>
                      </View>
                    </>
                  )
                }
            </View>

            {/* ===== ENGLISH ===== */}
            <View style={styles.card}>
              <Text style={styles.question}>
                {question.question.english}
              </Text>

              {question.options.map((opt, i) => {
                const selected = answers[qIndex] === i;
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
                    onPress={() =>
                      !submitted &&
                      !reviewMode &&
                      setAnswers((prev) => ({
                        ...prev,
                        [qIndex]: i,
                      }))
                    }
                  >
                    <Text style={[styles.optionText, { color }]}>
                      {i + 1}. {opt.english}
                    </Text>
                  </TouchableOpacity>
                );
              })}
                 {/* ===== ENGLISH EXPLANATION ===== */ }
                {
                  (reviewMode || submitted) && (
                    <>
                      <Text style={styles.exTitle}>Explanation</Text>
                      <View style={styles.exBox}>
                        <Text style={styles.exText}>
                          {question.explanation?.english || "—"}
                        </Text>
                      </View>
                    </>
                  )
                }
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ===== SUBMIT BUTTON (ONLY ON LAST QUESTION) ===== */}
      {currentIndex === questions.length - 1 &&
        !submitted &&
        !reviewMode && (
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={submitTest}
            disabled={submitting}
          >
            <Text style={styles.submitText}>
              {submitting ? "Submitting..." : "Submit Test"}
            </Text>
          </TouchableOpacity>
        )}
    </>
  );

}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  page: { width, padding: 20, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  timer: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff5252",
  },
  count: {
    textAlign: "center",
    marginBottom: 10,
    color: "#666",
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
    marginBottom: 12,
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
  },
  exBox: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 14,
    marginTop: 6,
  },
  exText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  submitBtn: {
    backgroundColor: "#2e7d32",
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 10,
    marginBottom: 30,
  },

  submitText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },

});
