import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
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

  const navigation = useNavigation();

  const filteredUsers = users.filter((u) =>
  u.email.toLowerCase().includes(search.toLowerCase())
);



  /* =====================
     FETCH USERS
  ====================== */
  const fetchUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await api.get("/auth/admin/users");

      setUsers(res.data.users || []);
    } catch (err) {
      console.log("❌ FETCH USERS ERROR:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

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
  const handleAction = async (type, userId) => {
    try {
      setActionLoading(userId);

      let endpoint = "";
      if (type === "suspend") endpoint = "/auth/admin/suspend-user";

      await api.post(endpoint, { userId });

      Toast.show({
        type: "success",
        text1: `User ${type}d successfully`,
      });

      fetchUsers(true);
    } catch (err) {
      console.log("❌ ACTION ERROR:", err.response?.data || err.message);

      Toast.show({
        type: "error",
        text1: err.response?.data?.message || "Action failed",
      });
    } finally {
      setActionLoading(null);
    }
  };

  /* =====================
     CONFIRM ACTION
  ====================== */
  const confirmAction = (type, userId) => {
    
    Alert.alert(
      "Confirm Action",
      `Are you sure you want to ${type} this user?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => handleAction(type, userId),
        },
      ]
    );
  };

  /* =====================
     RENDER USER CARD
  ====================== */
  const renderUser = ({ item }) => {
    const statusColor =
      item.isBlocked ? "#e53935" :
      item.status === "active" ? "#4caf50" : "#ffa726";

    const isBusy = actionLoading === item._id;

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>

        <Text style={[styles.status, { color: statusColor }]}>
          {item.isBlocked ? "Blocked" : item.status}
        </Text>

        <View style={styles.actions}>
        <TouchableOpacity
  style={[styles.suspend, isBusy && styles.disabled]}
  onPress={() => confirmAction("suspend", item._id)}
  disabled={isBusy}
>
  <Text style={styles.actionText}>Suspend</Text>
</TouchableOpacity>




      
        </View>

        {isBusy && (
          <ActivityIndicator
            size="small"
            color="#fff"
            style={{ marginTop: 10 }}
          />
        )}
      </View>
    );
  };

  /* =====================
     FIRST LOAD
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
   

    {/* 🔍 SEARCH */}
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
  actions: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  suspend: {
  backgroundColor: "#ffa726",
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: "center",
  marginTop: 10,
  width: "100%",          // ✅ FULL WIDTH
},

  block: {
    backgroundColor: "#e53935",
    padding: 8,
    borderRadius: 6,
  },
  activate: {
    backgroundColor: "#4caf50",
    padding: 8,
    borderRadius: 6,
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


});
