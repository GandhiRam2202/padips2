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
      const res = await api.get("/admin/users");

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

      await api.post("/admin/activate-user", { userId });

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
        <View style={styles.header}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.status}>
            {item.isBlocked ? "Blocked" : "Suspended"}
          </Text>
        </View>

        <Text style={styles.email}>{item.email}</Text>

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
        <ActivityIndicator size="large" color="#4f7cff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* SEARCH */}
      <TextInput
        placeholder="Search by email"
        placeholderTextColor="#999"
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
            tintColor="#4f7cff"
            colors={["#4f7cff"]}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No blocked users</Text>
        }
        contentContainerStyle={{ paddingBottom: 30 }}
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

  loader: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  search: {
    backgroundColor: "#00c3ff73",
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: "#000000ff",
    marginBottom: 14,
    fontWeight:"bold",
  },
  
  card: {
    backgroundColor: "#bcd5daff",
    borderRadius: 20,
    padding: 10,
    marginBottom: 14,
  },
  
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  
  name: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  
  email: {
    color: "#666",
    fontSize: 18,
    fontWeight:"bold",
    marginBottom: 6,
  },

  status: {
    color: "#e53935",
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  reason: {
    color: "#ff0000ff",
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },

  activateBtn: {
    backgroundColor: "#2e7d32",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
  },

  activateText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },

  disabled: {
    opacity: 0.6,
  },

  empty: {
    color: "#777",
    textAlign: "center",
    marginTop: 40,
  },
});
