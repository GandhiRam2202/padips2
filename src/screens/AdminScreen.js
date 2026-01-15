import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import api from "../api/axios";
import Toast from "react-native-toast-message";
import { TextInput } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

export default function AdminScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState("");

  // 🔴 Suspend Modal State
  const [showSuspend, setShowSuspend] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const navigation = useNavigation();

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  /* =====================
     FETCH USERS
  ====================== */
  const fetchUsers = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const res = await api.get("/auth/admin/users");
      setUsers(res.data.users || []);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: err.response?.data?.message || "Failed to load users",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =====================
     ADMIN ACTION
  ====================== */
  const handleSuspend = async () => {
    if (!reason.trim()) {
      Toast.show({ type: "error", text1: "Reason is required" });
      return;
    }

    try {
      setActionLoading(selectedUser);

      await api.post("/auth/admin/suspend-user", {
        userId: selectedUser,
        reason,
      });

      Toast.show({
        type: "success",
        text1: "User suspended successfully",
      });

      setShowSuspend(false);
      setReason("");
      setSelectedUser(null);
      fetchUsers(true);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: err.response?.data?.message || "Suspend failed",
      });
    } finally {
      setActionLoading(null);
    }
  };

  /* =====================
     RENDER USER
  ====================== */
  const renderUser = ({ item }) => {
    const statusColor =
      item.isBlocked
        ? "#e53935"
        : item.status === "active"
        ? "#4caf50"
        : "#ffa726";

    const isBusy = actionLoading === item._id;

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>

        <Text style={[styles.status, { color: statusColor }]}>
          {item.isBlocked ? "Blocked" : item.status}
        </Text>

        <TouchableOpacity
          style={[styles.suspend, isBusy && styles.disabled]}
          onPress={() => {
            setSelectedUser(item._id);
            setReason("");
            setShowSuspend(true);
          }}
          disabled={isBusy}
        >
          <Text style={styles.actionText}>Suspend</Text>
        </TouchableOpacity>

        {isBusy && (
          <ActivityIndicator size="small" color="#fff" style={{ marginTop: 10 }} />
        )}
      </View>
    );
  };

  /* =====================
     LOADING
  ====================== */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* SEARCH */}
      <TextInput
        placeholder="Search by email"
        placeholderTextColor="#aaa"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.blockedBtn}
        onPress={() => navigation.navigate("BlockedUsers")}
      >
        <Text style={styles.blockedText}>View Blocked Users</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        renderItem={renderUser}
        refreshing={refreshing}
        onRefresh={() => fetchUsers(true)}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No users found</Text>
        }
      />

      {/* =====================
         SUSPEND MODAL
      ====================== */}
      {showSuspend && (
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Suspend User</Text>

            <TextInput
              placeholder="Enter suspend reason"
              placeholderTextColor="#aaa"
              value={reason}
              onChangeText={setReason}
              style={styles.modalInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowSuspend(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.okBtn}
                onPress={handleSuspend}
              >
                <Text style={styles.btnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    padding: 20,
  },

  card: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
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
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "capitalize",
  },

  suspend: {
    backgroundColor: "#ffa726",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },

  disabled: {
    opacity: 0.5,
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

  search: {
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 15,
  },

  blockedBtn: {
    backgroundColor: "#e53935",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },

  blockedText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },

  /* MODAL */
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "85%",
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 20,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  modalInput: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    marginBottom: 15,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "#555",
    padding: 12,
    borderRadius: 8,
    marginRight: 5,
    alignItems: "center",
  },

  okBtn: {
    flex: 1,
    backgroundColor: "#e53935",
    padding: 12,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
