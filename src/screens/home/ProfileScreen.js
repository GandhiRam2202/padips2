import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useEffect, useState, useCallback, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import api from "../../api/axios";
import { AuthContext } from "../../auth/AuthContext";

export default function ProfileScreen() {
  const { logout } = useContext(AuthContext); // ✅ CENTRAL LOGOUT

  const [user, setUser] = useState(null);
  const [results, setResults] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  /* =====================
     LOAD USER (LOCAL ONLY)
  ====================== */
  const loadUserFromStorage = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData) {
        setUser(JSON.parse(userData));
    }
};

/* =====================
FETCH TEST SCORES ONLY
====================== */
const loadScores = async () => {
  try {
    const userData = await AsyncStorage.getItem("user");
    if (!userData) return;

    const user = JSON.parse(userData);

    const res = await api.post("/tests/profile", {
      email: user.email,   // ✅ send email in req.body
    });

    if (Array.isArray(res.data?.data)) {
      setResults(res.data.data);
    } else {
      setResults([]);
    }
  } catch (err) {
    Toast.show({
      type: "error",
      text1: "Failed to load test scores",
    });
    setResults([]);
  }
};


  /* =====================
     INITIAL LOAD
  ====================== */
  const loadAll = async () => {
    setLoading(true);
    await loadUserFromStorage(); // ✅ local
    await loadScores();          // ✅ api
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  /* 🔄 Pull to Refresh */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadScores();
    setRefreshing(false);
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#ff0000"]}
          tintColor="#fff"
        />
      }
    >
      {/* PROFILE IMAGE */}
      <View style={styles.image}>
        <Image
          source={require("../../../assets/profile.png")}
          style={{ width: 150, height: 150 }}
        />
      </View>

      {/* USER INFO */}
      <Text style={styles.text}>{user?.name}</Text>
      <Text style={styles.text}>{user?.email}</Text>

      {/* SCORES */}
      <Text style={styles.sectionTitle}>📊 Test Scores</Text>

      {results.length === 0 ? (
        <Text style={styles.empty}>No tests attempted</Text>
      ) : (
        results.map((item, index) => (
          <View key={index} style={styles.scoreRow}>
            <Text style={styles.scoreText}>Test {item.test}</Text>
            <Text style={styles.scoreText}>Score: {item.score}</Text>
          </View>
        ))
      )}

      {/* LOGOUT */}
      <View style={styles.buttonview}>
        <TouchableOpacity style={styles.button} onPress={logout}>
          <Text style={styles.btnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* =====================
        STYLES
===================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  image: {
    alignItems: "center",
    marginVertical: 20,
  },
  text: {
    textAlign:"center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#0db107ff",
    marginBottom: 6,
  },
  sectionTitle: {
    color: "#ff0000ff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 30,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#d80808ff",
  },
  empty: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 10,
  },
  buttonview: {
    alignItems: "center",
    marginVertical: 30,
  },
  button: {
    backgroundColor: "#e53935",
    padding: 15,
    borderRadius: 8,
    width: "50%",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
