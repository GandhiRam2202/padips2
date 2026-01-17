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
import api from "../api/axios";
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

      const testRes = await api.get("/tests");
      const testList = testRes.data?.data || [];
      setTests(testList);

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
    } catch {
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
    Alert.alert("Start Test", "Are you ready to take the test?", [
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
    ]);
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
      {loading && !refreshing && (
        <ActivityIndicator size="large" color="#4f7cff" />
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchTests(true)}
            tintColor="#4f7cff"
            colors={["#4f7cff"]}
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
                styles.card,
                attemptedTest && styles.submittedCard,
                !unlocked && styles.lockedCard,
              ]}
              onPress={() =>
                attemptedTest
                  ? openReview(testNo)
                  : confirmStartTest(testNo)
              }
            >
              <Text style={styles.testTitle}>Test {testNo}</Text>

              {!unlocked && (
                <Text style={styles.lockText}>🔒 Locked</Text>
              )}

              {attemptedTest && (
                <Text style={styles.scoreText}>
                  ✓ Submitted • Score: {scores[testNo]}
                </Text>
              )}

              {!attemptedTest && unlocked && (
                <Text style={styles.startText}>
                  Tap to Start
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
    backgroundColor: "#fff",
    paddingTop: 10,
    padding: 18,
  },
  scroll: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#4f7cff",
    padding: 18,
    borderRadius: 25,
    marginBottom: 14,
  },
  submittedCard: {
    backgroundColor: "#2ab576ff",
  },
  lockedCard: {
    backgroundColor: "#732323ff",
    opacity: 0.6,
    color: "#ffffffff",

  },
  testTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffffff",
    textAlign: "center",
  },
  scoreText: {
    marginTop: 6,
    fontSize: 15,
    color: "#ffffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
  startText: {
    marginTop: 6,
    fontSize: 14,
    color: "#fcfcfcff",
    textAlign: "center",
  },
  lockText: {
    marginTop: 6,
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
  },
  emptyText: {
    marginTop: 40,
    fontSize: 16,
    color: "#ffffffff",
    textAlign: "center",
  },
});
