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
      style={styles.testBtn}
      onPress={() =>
        navigation.navigate("LearnQuestions", { test: item })
      }
    >
      <Text style={styles.btnText}>Q & A - {item}</Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tests}
        keyExtractor={(item) => item.toString()}
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#ff0000"]}   // Android
            tintColor="#fff"       // iOS
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
    backgroundColor: "#000",
    padding: 10,
  },
  center: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  testBtn: {
    backgroundColor: "#ff0000",
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
