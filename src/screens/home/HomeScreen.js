import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import api from "../../api/axios";

export default function HomeScreen({ navigation }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* =====================
     FETCH TEST NUMBERS
  ====================== */
  const fetchTests = async () => {
    try {
      const res = await api.get("/tests");
      if (!res.data?.success) throw new Error();
      setTests(res.data.data);
    } catch {
      alert("Failed to load tests");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  /* 🔄 Pull to Refresh */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTests();
  }, []);

  /* =====================
     RENDER TEST ITEM
  ====================== */
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.testCard}
      onPress={() =>
        navigation.navigate("LearnQuestions", { test: item })
      }
    >
      <Text style={styles.testTitle}>Test {item}</Text>
      <Text style={styles.testSub}>Q & A</Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f7cff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <FlatList
        data={tests}
        keyExtractor={(item) => item.toString()}
        renderItem={renderItem}
        numColumns={3}                 // 👈 3 columns
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4f7cff"]}   // Android
            tintColor="#4f7cff"    // iOS
          />
        }
      />

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
    padding: 16,
  },
  center: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
    textAlign: "center",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 14,
  },
  testCard: {
    flex: 1,
    backgroundColor: "#4f7cff",
    marginHorizontal: 6,
    paddingVertical: 26,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  testTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  testSub: {
    marginTop: 4,
    fontSize: 14,
    color: "#fff",
  },
});
