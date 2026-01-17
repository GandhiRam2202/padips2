import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState, useCallback, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import api from "../../api/axios";
import { AuthContext } from "../../auth/AuthContext";

export default function ProfileScreen() {
  const { logout } = useContext(AuthContext);

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
     FETCH TEST SCORES
  ====================== */
  const loadScores = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) return;

      const user = JSON.parse(userData);

      const res = await api.post("/tests/profile", {
        email: user.email,
      });

      if (Array.isArray(res.data?.data)) {
        setResults(res.data.data);
      } else {
        setResults([]);
      }
    } catch {
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
    await loadUserFromStorage();
    await loadScores();
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
        <ActivityIndicator size="large" color="#4f7cff" />
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
          colors={["#4f7cff"]}
          tintColor="#4f7cff"
        />
      }
    >
      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        <Image
          source={require("../../../assets/profile.png")}
          style={styles.avatar}
        />

        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* SCORES */}
      <Text style={styles.sectionTitle}>📊 Test Scores</Text>

      {results.length === 0 ? (
        <Text style={styles.empty}>No tests attempted</Text>
      ) : (
        results.map((item, index) => (
          <View key={index} style={styles.scoreCard}>
            <Text style={styles.scoreLeft}>Test {item.test}</Text>
            <Text style={styles.scoreRight}>{item.score}</Text>
          </View>
        ))
      )}

      {/* LOGOUT */}
      <View style={styles.buttonView}>
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
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    backgroundColor: "#ffffffff",
    margin: 10,
    alignItems: "center",
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  email: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000ff",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4f7cff",
    textAlign: "center",
    marginBottom: 10,
  },
  scoreCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#4f7cff",
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  scoreLeft: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffffff",
  },
  scoreRight: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffffff",
  },
  empty: {
    textAlign: "center",
    color: "#110000ff",
    marginTop: 10,
  },
  buttonView: {
    alignItems: "center",
  },
  button: {
    backgroundColor: "#ff0000ff",
    paddingVertical: 14,
    borderRadius: 30,
    width: "40%",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 22,
  },
});
