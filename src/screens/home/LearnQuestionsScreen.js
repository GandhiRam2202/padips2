import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Switch,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
// Correct Safe Area library
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import api from "../../api/axios";

const { width } = Dimensions.get("window");

/* =====================
   IMAGE RENDERER
===================== */
const RenderImages = ({ images }) => {
  if (!images || !images.length) return null;

  return (
    <View style={styles.imageBlock}>
      {images.map((img, i) => (
        <Image
          key={i}
          source={img}
          style={styles.diagramImage}
          contentFit="contain"
          cachePolicy="disk"
        />
      ))}
    </View>
  );
};

export default function LearnQuestionsScreen({ route }) {
  const { test } = route.params;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("tamil");
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollRef = useRef(null);
  const topBarScrollRef = useRef(null); // Added for auto-moving selector

  const fetchQuestions = async () => {
    try {
      const res = await api.post("/tests/questions", { test });
      if (!res.data?.success) throw new Error();
      setQuestions(res.data.data);
    } catch {
      alert("Failed to load questions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [test]);

  // NEW: Effect to move the top bar when the question index changes
  useEffect(() => {
    if (topBarScrollRef.current && questions.length > 0) {
      // 42 is the approximate width of the button (34) + horizontal margins (4+4)
      const targetX = currentIndex * 42 - (width / 2) + 21; 
      topBarScrollRef.current.scrollTo({
        x: Math.max(0, targetX),
        animated: true,
      });
    }
  }, [currentIndex, questions]);

  const handleScroll = (event) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(xOffset / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
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
        {/* AUTO-MOVING TOP BAR */}
        <View style={styles.topBar}>
          <View style={styles.qListContainer}>
            <ScrollView 
              ref={topBarScrollRef} // Attached ref
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.qListContent}
            >
              {questions.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.qBtn, currentIndex === i && styles.activeQBtn]}
                  onPress={() => {
                    scrollRef.current?.scrollTo({ x: i * width, animated: true });
                    setCurrentIndex(i);
                  }}
                >
                  <Text style={[styles.qBtnText, currentIndex === i && styles.activeQBtnText]}>
                    {i + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.langSwitchContainer}>
            <Text style={styles.langLabel}>
              {language === "tamil" ? "தமிழ்" : "Eng"}
            </Text>
            <Switch
              value={language === "tamil"}
              onValueChange={(v) => setLanguage(v ? "tamil" : "english")}
              trackColor={{ false: "#767577", true: "#4f7cff" }}
              thumbColor="#fff"
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        </View>

        {/* QUESTIONS PAGINATION */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchQuestions(); }} />
          }
        >
          {questions.map((q, qIndex) => (
            <ScrollView key={q._id || qIndex} style={styles.page} nestedScrollEnabled>
              <Text style={styles.count}>
                Test {test} • Question {qIndex + 1} / {questions.length}
              </Text>

              {q.questionType === "match_the_following"
                ? renderMatch(q, language)
                : renderMCQ(q, language)}
              
              <View style={{ height: 50 }} /> 
            </ScrollView>
          ))}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

/* ======================================================
   SUB-RENDERERS
====================================================== */
const renderMCQ = (q, lang) => (
  <View style={styles.card}>
    <Text style={styles.question}>{q.question[lang]}</Text>
    <RenderImages images={q.question?.images} />

    {q.options.map((opt, i) => {
      const isCorrect = i === q.correctAnswer - 1;
      return (
        <View key={i} style={[styles.option, isCorrect && styles.correct]}>
          <Text style={[styles.optionText, isCorrect && styles.correctText]}>
            {i + 1}. {opt[lang]}
          </Text>
        </View>
      );
    })}

    <View style={styles.exBox}>
      <Text style={styles.exTitle}>{lang === "tamil" ? "விளக்கம்" : "Explanation"}</Text>
      <Text style={styles.exText}>{q.explanation?.[lang]}</Text>
    </View>
  </View>
);

const renderMatch = (q, lang) => (
  <View style={styles.card}>
    <Text style={styles.question}>{q.question[lang]}</Text>
    <View style={styles.matchRow}>
      <View style={styles.matchCol}>
        {q.matchLeft?.map((l) => (
          <Text key={l.key} style={styles.matchItem}>({l.key}) {l[lang]}</Text>
        ))}
      </View>
      <View style={styles.matchCol}>
        {q.matchRight?.map((r) => (
          <Text key={r.key} style={styles.matchItem}>{r.key}. {r[lang]}</Text>
        ))}
      </View>
    </View>

    {q.options.map((opt, i) => {
      const isCorrect = i === q.correctAnswer - 1;
      return (
        <View key={i} style={[styles.option, isCorrect && styles.correct]}>
          <Text style={[styles.optionText, isCorrect && styles.correctText]}>{opt[lang]}</Text>
        </View>
      );
    })}

    {/* FIXED: Explanation now shows for Match questions too */}
    <View style={styles.exBox}>
      <Text style={styles.exTitle}>{lang === "tamil" ? "விளக்கம்" : "Explanation"}</Text>
      <Text style={styles.exText}>{q.explanation?.[lang]}</Text>
    </View>
  </View>
);

/* =====================
        STYLES
===================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    height: 55,
    paddingHorizontal: 5,
  },
  qListContainer: { flex: 1 },
  qListContent: { alignItems: "center", paddingHorizontal: 10 },
  qBtn: {
    backgroundColor: "#f0f0f0",
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 17,
    marginHorizontal: 4,
  },
  activeQBtn: { backgroundColor: "#4f7cff" },
  qBtnText: { fontWeight: "bold", color: "#333", fontSize: 13 },
  activeQBtnText: { color: "#fff" },

  langSwitchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: "#eee",
  },
  langLabel: { fontSize: 11, fontWeight: "bold", color: "#666", marginRight: -2 },

  page: { width, padding: 20 },
  count: { textAlign: "center", fontWeight: "bold", marginBottom: 15, color: "#888", fontSize: 12 },
  card: { backgroundColor: "#f4f6ff", padding: 16, borderRadius: 18, marginBottom: 20 },
  question: { fontSize: 17, fontWeight: "bold", lineHeight: 24, marginBottom: 10 },

  imageBlock: { alignItems: "center", marginVertical: 10 },
  diagramImage: { width: width * 0.8, height: 160, borderRadius: 8 },

  option: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginTop: 10,
  },
  optionText: { fontSize: 15, fontWeight: "600" },
  correct: { backgroundColor: "#e8f8ee", borderColor: "#2e7d32" },
  correctText: { color: "#2e7d32", fontWeight: "bold" },

  exBox: { backgroundColor: "#fff", padding: 14, borderRadius: 12, marginTop: 15, borderLeftWidth: 4, borderLeftColor: "#4f7cff" },
  exTitle: { fontSize: 14, fontWeight: "bold", color: "#4f7cff", marginBottom: 4 },
  exText: { fontSize: 15, color: "#444", lineHeight: 22 },

  matchRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 10 },
  matchCol: { width: "48%" },
  matchItem: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "bold",
  },
});