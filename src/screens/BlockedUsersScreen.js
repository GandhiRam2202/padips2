import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import Toast from "react-native-toast-message";

export default function BlockedUsersScreen() {
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  /* =====================
     FETCH BLOCKED USERS
  ====================== */
  const fetchBlockedUsers = async () => {
    try {
      const res = await api.get("/auth/admin/users");

      const blocked = (res.data.users || []).filter(
        (u) => u.isBlocked || u.status === "suspended"
      );

      setAllUsers(blocked);
      setUsers(blocked);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Failed to load blocked users",
      });
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchBlockedUsers();
      setLoading(false);
    })();
  }, []);

  /* =====================
     SEARCH
  ====================== */
  const handleSearch = (text) => {
    setSearch(text);

    if (!text.trim()) {
      setUsers(allUsers);
      return;
    }

    const filtered = allUsers.filter((u) =>
      u.email.toLowerCase().includes(text.toLowerCase())
    );

    setUsers(filtered);
  };

  /* =====================
     ACTIVATE USER
  ====================== */
  const activateUser = async (userId) => {
    try {
      setActionLoading(userId);

      await api.post("/auth/admin/activate-user", { userId });

      Toast.show({
        type: "success",
        text1: "User activated successfully",
      });

      await fetchBlockedUsers();
    } catch (err) {
      Toast.show({
        type: "error",
        text1: err.response?.data?.message || "Failed to activate user",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const confirmActivate = (userId) => {
    Alert.alert(
      "Activate User",
      "Are you sure you want to activate this user?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Activate",
          style: "default",
          onPress: () => activateUser(userId),
        },
      ]
    );
  };

  /* =====================
     PULL TO REFRESH
  ====================== */
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setSearch("");
      await fetchBlockedUsers();
    } finally {
      setRefreshing(false);
    }
  }, []);

  /* =====================
     RENDER ITEM
  ====================== */
  const renderItem = ({ item }) => {
    const busy = actionLoading === item._id;

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>

        <Text style={styles.status}>
          {item.isBlocked ? "Blocked" : "Suspended"}
        </Text>

        {item.suspendReason && (
          <Text style={styles.reason}>
            Reason: {item.suspendReason}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.activateBtn, busy && styles.disabled]}
          onPress={() => confirmActivate(item._id)}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.activateText}>Activate</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <TextInput
        placeholder="Search by email"
        placeholderTextColor="#aaa"
        value={search}
        onChangeText={handleSearch}
        style={styles.search}
        autoCapitalize="none"
      />

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={["#4caf50"]}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No blocked users</Text>
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
    paddingTop: 5,
    padding:20,
  },
  search: {
    backgroundColor: "#111",
    borderRadius: 8,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#e53935",
  },
  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  email: {
    color: "#aaa",
    marginBottom: 5,
  },
  status: {
    color: "#e53935",
    fontWeight: "bold",
    marginBottom: 5,
  },
  reason: {
    color: "#ffa726",
    fontSize: 14,
    marginBottom: 8,
  },
  activateBtn: {
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  activateText: {
    color: "#fff",
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.6,
  },
  loader: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 50,
  },
});
