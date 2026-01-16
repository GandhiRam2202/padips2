import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import api from "../../api/axios";


export default function LeaderBoardScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ================= FETCH LEADERBOARD ================= */
  const fetchLeaderboard = async () => {
    try {

      const res = await api.get("/tests/leaderboard");

      if (res.data?.success) {
        setData(res.data.data || []);
      } else {
        setData([]);
      }
    } catch (err) {
      console.log("Leaderboard error:", err.message);
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLeaderboard();
  }, []);

  /* ================= RANK BADGE ================= */
  const getRankBadge = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  /* ================= RENDER ITEM ================= */
  const renderItem = ({ item, index }) => (
    <View style={styles.row}>
      <Text style={styles.rank}>{getRankBadge(index)}</Text>

      <View style={styles.userBox}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>
          Tests: {item.tests} | Total: {item.totalScore}
        </Text>
      </View>

      <Text style={styles.avg}>{item.avgScore}</Text>
    </View>
  );

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  /* ================= UI ================= */
  return (
    <View style={styles.container}>

      <FlatList
        data={data}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#ff0000"]}
            tintColor="#ff0000"
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No leaderboard data</Text>
        }
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },

  rank: {
    width: 50,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFD700",
  },

  userBox: {
    flex: 1,
    alignItems: "center",
  },

  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  sub: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 2,
  },

  avg: {
    color: "#00e676",
    fontSize: 20,
    fontWeight: "bold",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },

  empty: {
    color: "#777",
    textAlign: "center",
    marginTop: 40,
  },
});
