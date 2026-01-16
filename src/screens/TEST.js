import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import api from "../api/axios"; // ✅ axios with token interceptor
import { getUser } from "../utils/storage";

export default function TestScreen({ navigation }) {
  const [tests, setTests] = useState([]);
  const [attempted, setAttempted] = useState({});
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* =====================
     FETCH TESTS
  ====================== */
  const fetchTests = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);

      const user = await getUser();
      if (!user?.email) {
        Toast.show({ type: "error", text1: "Session expired" });
        return;
      }

      // ✅ 1. Get available tests
      const testRes = await api.get("/tests");
      const testList = testRes.data?.data || [];

      setTests(testList);

      // ✅ 2. Check attempts
      const attemptMap = {};
      const scoreMap = {};

      for (const testNo of testList) {
        const res = await api.post("/tests/check-attempt", {
          test: testNo,
          email: user.email,
        });

        attemptMap[testNo] = res.data.attempted;
        scoreMap[testNo] = res.data.score || 0;
      }

      setAttempted(attemptMap);
      setScores(scoreMap);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Failed to load tests",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =====================
     LOAD ON FOCUS
  ====================== */
  useFocusEffect(
    useCallback(() => {
      fetchTests();
    }, [])
  );

  /* =====================
     UNLOCK RULE
  ====================== */
  const isUnlocked = (testNo) => {
    if (testNo === 1) return true;
    return attempted[testNo - 1] === true;
  };

  /* =====================
     START TEST
  ====================== */
  const confirmStartTest = (testNo) => {
    Alert.alert(
      "Start Test",
      "Are you ready to take the test?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start",
          onPress: () =>
            navigation.navigate("TestQuestion", {
              test: testNo,
              mode: "test",
              startIndex: 0,
            }),
        },
      ]
    );
  };

  /* =====================
     REVIEW TEST
  ====================== */
  const openReview = (testNo) => {
    navigation.navigate("TestQuestion", {
      test: testNo,
      mode: "review",
    });
  };

  /* =====================
     UI
  ====================== */
  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#fff" />}

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchTests(true)}
            tintColor="#fff"
            colors={["#ff0000"]}
          />
        }
      >
        {tests.map((testNo) => {
          const attemptedTest = attempted[testNo];
          const unlocked = isUnlocked(testNo);

          return (
            <TouchableOpacity
              key={testNo}
              disabled={!unlocked}
              style={[
                styles.button,
                attemptedTest && styles.submittedButton,
                !unlocked && styles.lockedButton,
              ]}
              onPress={() =>
                attemptedTest
                  ? openReview(testNo)
                  : confirmStartTest(testNo)
              }
            >
              <Text style={styles.btnText}>Test {testNo}</Text>

              {!unlocked && (
                <Text style={styles.lockText}>🔒 Locked</Text>
              )}

              {attemptedTest && (
                <Text style={styles.scoreText}>
                  ✓ Submitted | Score: {scores[testNo]} (Tap to Review)
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        {!loading && tests.length === 0 && (
          <Text style={styles.emptyText}>No tests available</Text>
        )}
      </ScrollView>
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
  scroll: {
    alignItems: "center",
    paddingBottom: 30,
  },
  button: {
    width: "85%",
    marginBottom: 15,
    backgroundColor: "#ff0000",
    padding: 16,
    borderRadius: 10,
  },
  submittedButton: {
    backgroundColor: "#1b8f2a",
  },
  lockedButton: {
    backgroundColor: "#444",
    opacity: 0.5,
  },
  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  scoreText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    marginTop: 6,
    fontWeight: "bold",
  },
  lockText: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
  },
  emptyText: {
    marginTop: 30,
    fontSize: 16,
    color: "#777",
  },
});
