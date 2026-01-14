import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useEffect, useState, useCallback, useContext } from "react";
import { getUser } from "../../utils/storage";
import api from "../../api/axios";
import { AuthContext } from "../../auth/AuthContext";
import Toast from "react-native-toast-message";

export default function HomeScreen() {
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const storedUser = await getUser();
    setUser(storedUser);
  };

  /* =====================
     PULL TO REFRESH
  ====================== */
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      // 🔥 verify session with backend
      await api.get("/auth/me");

      // reload local user
      await loadUser();
    } catch (err) {
      // 🚫 blocked / suspended
      if (err.response?.status === 403) {
        Toast.show({
          type: "error",
          text1: err.response.data.message,
        });
        logout();
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#fff"
          colors={["#ff0000"]}
        />
      }
    >
      <Text style={styles.title}>
        {user ? `Hi ${user.name}` : "PADIPS2"}
      </Text>
      <Text style={styles.subtitle}>Welcome 🎉</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#000",
    alignItems: "center",

  },
  title: {
    color: "#ff0000",
    fontSize: 36,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#fff",
    fontSize: 20,
  },
});
