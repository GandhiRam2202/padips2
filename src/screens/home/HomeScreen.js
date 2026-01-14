import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useEffect, useState, useCallback, useContext } from "react";
import Toast from "react-native-toast-message";

import api from "../../api/axios";
import { getUser } from "../../utils/storage";
import { AuthContext } from "../../auth/AuthContext";

export default function HomeScreen() {
  const { logout } = useContext(AuthContext);

  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  /* =====================
     LOAD USER (LOCAL)
  ====================== */
  const loadUser = async () => {
    const storedUser = await getUser();
    setUser(storedUser);
  };

  useEffect(() => {
    loadUser();
  }, []);

  /* =====================
     VERIFY SESSION (API KEY + TOKEN)
  ====================== */
  const verifySession = async () => {
    try {
      await api.get("/auth/me", {
        headers: {
          "x-api-key": "PADIPS2_SECERET_KEY", // ✅ API KEY
        },
      });

      await loadUser();
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      // 🚫 blocked / suspended / token invalid
      if (status === 401 || status === 403) {
        Toast.show({
          type: "error",
          text1: message || "Session expired",
        });

        await logout();
      }
    }
  };

  /* =====================
     PULL TO REFRESH
  ====================== */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await verifySession();
    setRefreshing(false);
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

/* =====================
        STYLES
===================== */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#ff0000",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#fff",
    fontSize: 20,
  },
});
