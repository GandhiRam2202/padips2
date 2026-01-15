import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import api from "../../api/axios";


export default function HomeScreen({ navigation }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
 
  /* =====================
     FETCH TEST NUMBERS
  ====================== */
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await api.get("/auth/tests");
        if (!res.data?.success) throw new Error();
        setTests(res.data.data);
      } catch {
        alert("Failed to load tests");
      } finally {
        setLoading(false);
      }
    };

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
      <Text style={styles.btnText}>Test {item}</Text>
    </TouchableOpacity>
  );

  if (loading) {
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
