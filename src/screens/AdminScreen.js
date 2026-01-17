import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
      const res = await api.get("/admin/users");
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

      await api.post("/admin/suspend-user", {
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
        ? "#2e7d32"
        : "#ffa726";

    const isBusy = actionLoading === item._id;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={[styles.status, { color: statusColor }]}>
            {item.isBlocked ? "Blocked" : item.status}
          </Text>
        </View>

        <Text style={styles.email}>{item.email}</Text>

        <TouchableOpacity
          style={[styles.suspendBtn, isBusy && styles.disabled]}
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
          <ActivityIndicator
            size="small"
            color="#4f7cff"
            style={{ marginTop: 8 }}
          />
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
        onChangeText={setSearch}
        style={styles.search}
        autoCapitalize="none"
      />

      {/* BLOCKED USERS */}
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
              placeholderTextColor="#999"
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
                <Text style={styles.btnText}>Suspend</Text>
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

  blockedBtn: {
    backgroundColor: "#e53935",
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 16,
  },

  blockedText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },

  card: {
    backgroundColor: "#bcd5daff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  
  email: {
    color: "#666",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  status: {
    fontWeight: "bold",
    textTransform: "capitalize",
  },

  suspendBtn: {
    backgroundColor: "#ffa726",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 6,
  },

  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },

  empty: {
    color: "#777",
    textAlign: "center",
    marginTop: 40,
  },

  disabled: {
    opacity: 0.6,
  },

  /* MODAL */
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },

  modalTitle: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },

  modalInput: {
    backgroundColor: "#f4f6ff",
    borderRadius: 14,
    padding: 14,
    color: "#000",
    marginBottom: 16,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "#ccc",
    paddingVertical: 14,
    borderRadius: 30,
    marginRight: 6,
    alignItems: "center",
  },

  okBtn: {
    flex: 1,
    backgroundColor: "#e53935",
    paddingVertical: 14,
    borderRadius: 30,
    marginLeft: 6,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
