import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  ScrollView,
  Dimensions,
  Switch,
  Pressable,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
// Updated to use the correct Safe Area library
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Toast from "react-native-toast-message";
import api from "../api/axios";
import { getUser } from "../utils/storage";

const { width } = Dimensions.get("window");

/* 🔀 SHUFFLE */
const shuffleArray = (arr = []) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const toArray = (v) => (Array.isArray(v) ? v : []);

export default function TestQuestionScreen({ route, navigation }) {
  const { test } = route.params;

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  // FIX: Initialize with null so Auto-Submit doesn't trigger on mount
  const [timeLeft, setTimeLeft] = useState(null); 
  const timerRef = useRef(null);

  const [language, setLanguage] = useState("tamil");
  const scrollRef = useRef(null);
  const topBarScrollRef = useRef(null); // Ref for the question number bar

  /* 🔒 BLOCK BACK */
  useEffect(() => {
    const h = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => h.remove();
  }, []);

  /* 🎯 AUTO-SCROLL TOP BAR (Move selector when question changes) */
  useEffect(() => {
    if (topBarScrollRef.current && questions.length > 0) {
      // Logic to center the active question button in the top bar
      const targetX = currentIndex * 42 - (width / 2) + 21; 
      topBarScrollRef.current.scrollTo({
        x: Math.max(0, targetX),
        animated: true,
      });
    }
  }, [currentIndex, questions]);

  /* CHECK ATTEMPT */
  const checkAttempt = async () => {
    const user = await getUser();
    const res = await api.post("/tests/check-attempt", { test, email: user.email });
    if (res.data?.attempted) {
      setReviewMode(true);
      setSubmitted(true);
      setTimeLeft(0);
      return true;
    }
    return false;
  };

  /* FETCH QUESTIONS */
  const fetchQuestions = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const alreadyAttempted = await checkAttempt();
      
      const res = await api.post("/tests/questions", { test });
      const shuffled = shuffleArray(res.data.data);
      setQuestions(shuffled);

      if (!alreadyAttempted) {
        setTimeLeft(shuffled.length * 54);
      }
    } catch {
      Toast.show({ type: "error", text1: "Failed to load questions" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [test]);

  useEffect(() => {
    fetchQuestions();
    return () => clearInterval(timerRef.current);
  }, [fetchQuestions]);

  /* TIMER LOGIC */
  useEffect(() => {
    if (reviewMode || submitted || timeLeft === null || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, reviewMode, submitted]);

  /* AUTO SUBMIT FIX */
  useEffect(() => {
    if (timeLeft === 0 && !submitted && !reviewMode && questions.length > 0) {
      submitTest();
    }
  }, [timeLeft, questions.length]);

  const submitTest = async () => {
    if (submitted) return;

    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer - 1) score += 1.5;
    });

    const user = await getUser();
    try {
        await api.post("/tests/submit", {
            test,
            score,
            email: user.email,
            name: user.name,
          });
      
          setSubmitted(true);
          Toast.show({ type: "success", text1: "Test submitted" });
          setTimeout(() => navigation.popToTop(), 1500);
    } catch (e) {
        Toast.show({ type: "error", text1: "Submission failed" });
    }
  };

  const handleScroll = (event) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(xOffset / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const formatTime = (s) => {
    if (s === null) return "00:00";
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f7cff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* TOP BAR WITH AUTO-MOVE SELECTOR */}
        <View style={styles.unifiedTopBar}>
          <ScrollView 
            ref={topBarScrollRef}
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.qBar}
            contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 8 }}
          >
            {questions.map((_, i) => {
              const answered = answers[i] !== undefined;
              return (
                <Pressable
                  key={i}
                  onPress={() => {
                    scrollRef.current?.scrollTo({ x: i * width, animated: true });
                    setCurrentIndex(i);
                  }}
                  style={[
                    styles.qBtn,
                    reviewMode ? styles.qReview : answered ? styles.qAnswered : styles.qUnanswered,
                    i === currentIndex && styles.qActive,
                  ]}
                >
                  <Text style={[styles.qBtnText, (answered || reviewMode) && { color: '#fff' }, i === currentIndex && { color: '#000' }]}>
                    {i + 1}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.langSwitchContainer}>
            <Text style={styles.langLabel}>{language === "tamil" ? "த" : "En"}</Text>
            <Switch
              value={language === "tamil"}
              onValueChange={(v) => setLanguage(v ? "tamil" : "english")}
              trackColor={{ false: "#767577", true: "#4f7cff" }}
              thumbColor="#fff"
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        </View>

        {/* QUESTIONS */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchQuestions(true);
              }}
            />
          }
        >
          {questions.map((q, qIndex) => (
            <ScrollView key={qIndex} style={styles.page}>
              {!reviewMode && !submitted && (
                <Text style={styles.timer}>⏱ {formatTime(timeLeft)}</Text>
              )}
              <Text style={styles.count}>Question {qIndex + 1} / {questions.length}</Text>
              {q.questionType === "match_the_following" ? renderMatch(q, qIndex) : renderMCQ(q, qIndex)}
              <View style={{ height: 100 }} />
            </ScrollView>
          ))}
        </ScrollView>

        {/* SUBMIT BUTTON */}
        {!submitted && !reviewMode && currentIndex === questions.length - 1 && (
          <TouchableOpacity style={styles.submitBtn} onPress={submitTest}>
            <Text style={styles.submitText}>Submit Test</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );

  /* MCQ RENDERER */
  function renderMCQ(q, qIndex) {
    const correctIndex = q.correctAnswer - 1;
    return (
      <View style={styles.card}>
        <Text style={styles.question}>{q.question[language]}</Text>
        {toArray(q.question?.images).map((img, i) => (
          <Image key={i} source={img} style={styles.image} contentFit="contain" />
        ))}
        {q.options.map((opt, i) => {
          const selected = answers[qIndex] === i;
          const correct = i === correctIndex;
          return (
            <Pressable
              key={i}
              disabled={reviewMode || submitted}
              onPress={() => setAnswers((p) => ({ ...p, [qIndex]: i }))}
              style={[
                styles.option,
                selected && styles.selected,
                reviewMode && correct && styles.correct,
                reviewMode && selected && !correct && styles.wrong,
              ]}
            >
              <Text style={styles.optionText}>{i + 1}. {opt[language]}</Text>
            </Pressable>
          );
        })}
        {reviewMode && (
          <View style={styles.exBox}>
            <Text style={styles.exTitle}>Explanation</Text>
            <Text style={styles.exText}>{q.explanation?.[language]}</Text>
          </View>
        )}
      </View>
    );
  }

  /* MATCH RENDERER */
  function renderMatch(q, qIndex) {
    const correctIndex = q.correctAnswer - 1;
    return (
      <View style={styles.card}>
        <Text style={styles.question}>{q.question[language]}</Text>
        <View style={styles.matchRow}>
          <View style={styles.matchCol}>
            {q.matchLeft?.map((l) => (
              <Text key={l.key} style={styles.matchItem}>({l.key}) {l[language]}</Text>
            ))}
          </View>
          <View style={styles.matchCol}>
            {q.matchRight?.map((r) => (
              <Text key={r.key} style={styles.matchItem}>{r.key}. {r[language]}</Text>
            ))}
          </View>
        </View>
        {q.options.map((opt, i) => {
          const selected = answers[qIndex] === i;
          const correct = i === correctIndex;
          return (
            <Pressable
              key={i}
              disabled={reviewMode || submitted}
              onPress={() => setAnswers((p) => ({ ...p, [qIndex]: i }))}
              style={[
                styles.option,
                selected && styles.selected,
                reviewMode && correct && styles.correct,
                reviewMode && selected && !correct && styles.wrong,
              ]}
            >
              <Text style={styles.optionText}>{opt[language]}</Text>
            </Pressable>
          );
        })}
        {reviewMode && (
          <View style={styles.exBox}>
            <Text style={styles.exTitle}>Explanation</Text>
            <Text style={styles.exText}>{q.explanation?.[language]}</Text>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  unifiedTopBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", height: 60, borderBottomWidth: 1, borderBottomColor: "#eee" },
  qBar: { flex: 1 },
  qBtn: { width: 34, height: 34, marginHorizontal: 4, borderRadius: 17, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f0f0" },
  qBtnText: { fontWeight: "bold", fontSize: 13 },
  qAnswered: { backgroundColor: "#2e7d32" },
  qUnanswered: { backgroundColor: "#c62828" },
  qReview: { backgroundColor: "#e3ebff" },
  qActive: { borderWidth: 2, borderColor: "#000", backgroundColor: "#fff" },
  langSwitchContainer: { flexDirection: "row", alignItems: "center", paddingRight: 10, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: "#eee" },
  langLabel: { fontSize: 12, fontWeight: "bold", marginRight: 2, color: "#666" },
  page: { width, padding: 16 },
  timer: { textAlign: "center", color: "#ff5252", fontWeight: "bold", fontSize: 16, marginBottom: 5 },
  count: { textAlign: "center", marginBottom: 15, color: "#888", fontWeight: "600" },
  card: { backgroundColor: "#f4f6ff", padding: 16, borderRadius: 16 },
  question: { fontWeight: "bold", fontSize: 16, lineHeight: 22, marginBottom: 10 },
  image: { width: "100%", height: 180, marginVertical: 8, borderRadius: 8 },
  option: { padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#ddd", marginBottom: 10, backgroundColor: "#fff" },
  selected: { backgroundColor: "#eef3ff", borderColor: "#4f7cff" },
  correct: { backgroundColor: "#e8f8ee", borderColor: "#2e7d32" },
  wrong: { backgroundColor: "#fdecea", borderColor: "#c62828" },
  optionText: { fontWeight: "600", fontSize: 15 },
  exBox: { backgroundColor: "#fff", padding: 12, borderRadius: 10, marginTop: 15, borderLeftWidth: 4, borderLeftColor: "#4f7cff" },
  exTitle: { fontWeight: "bold", color: "#4f7cff", marginBottom: 4 },
  exText: { fontSize: 14, lineHeight: 20 },
  submitBtn: { backgroundColor: "#2e7d32", padding: 16, borderRadius: 30, margin: 20 },
  submitText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
  matchRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  matchCol: { width: "48%" },
  matchItem: { backgroundColor: "#fff", padding: 10, borderRadius: 8, marginBottom: 8, elevation: 1, fontWeight: "bold", fontSize: 12 },
});