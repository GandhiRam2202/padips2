import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    BackHandler,
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
                throw new Error("Invalid questions");
            }

            const shuffled = shuffleArray(res.data.data);
            setQuestions(shuffled);

            // ⏱ Timer ONLY for first attempt
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
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    if (!questions.length) {
        return (
            <View style={styles.center}>
                <Text style={{ color: "#fff" }}>No questions available</Text>
            </View>
        );
    }

    const question = questions[currentIndex];

    /* ================= RENDER ================= */
    return (
        <View style={styles.container}>


            {!reviewMode && !submitted && (
                <Text style={styles.timer}>⏱ {formatTime(timeLeft)}</Text>
            )}

            <Text style={styles.count}>
                Q {currentIndex + 1} / {questions.length}
            </Text>

            <Text style={styles.question}>{question.question}</Text>

            {question.options.map((opt, i) => {
                const selected = answers[currentIndex] === i;
                const correct = i === question.correctAnswer;

                let bg = "#fff";
                if (reviewMode || submitted) {
                    if (correct) bg = "#4caf50";
                    else if (selected) bg = "#777";
                } else if (selected) {
                    bg = "#0fe352";
                }

                return (
                    <TouchableOpacity
                        key={i}
                        style={[styles.option, { backgroundColor: bg }]}
                        onPress={() => selectOption(i)}
                        disabled={submitted || reviewMode}
                    >
                        <Text style={styles.optionText}>
                            {i + 1}. {opt}
                        </Text>
                    </TouchableOpacity>
                );
            })}
            {reviewMode && (
                <>
                    <Text style={styles.explanation}>Explanation</Text>
                    <Text style={styles.question}>{question.explanation}</Text>
                </>
            )}

            <View style={styles.navRow}>
                <TouchableOpacity
                    disabled={currentIndex === 0}
                    onPress={() => setCurrentIndex((i) => i - 1)}
                    style={[styles.navBtn, currentIndex === 0 && styles.disabled]}
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
                    !submitted && !reviewMode && (
                        <TouchableOpacity
                            onPress={submitTest}
                            style={styles.submitBtn}
                        >
                            <Text style={styles.submitText}>Submit Test</Text>
                        </TouchableOpacity>
                    )
                )}
            </View>
        </View>
    );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000", padding: 20 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

    reviewLabel: {
        color: "#FFD700",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 6,
    },

    timer: { color: "#ff0000", fontSize: 20, fontWeight: "bold", textAlign: "center" },
    count: { color: "#fff", textAlign: "center", fontWeight: "bold" },
    question: { color: "#fff", fontSize: 20, fontWeight: "bold", marginVertical: 20 },
    explanation: { color: "#ff0000ff", fontSize: 20, fontWeight: "bold", marginTop: 20 },

    option: {
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#fff",
        marginBottom: 12,
    },

    optionText: { fontSize: 18, fontWeight: "bold" },

    navRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
    navBtn: { backgroundColor: "#ff0000", padding: 14, borderRadius: 8, width: "45%" },
    submitBtn: { backgroundColor: "#1b8f2a", padding: 14, borderRadius: 8, width: "45%" },

    navText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
    submitText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
    disabled: { opacity: 0.5 },
});
