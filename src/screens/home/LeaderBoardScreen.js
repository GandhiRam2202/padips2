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
    <View style={styles.card}>
      <View style={styles.rankBox}>
        <Text style={styles.rank}>{getRankBadge(index)}</Text>
      </View>

      <View style={styles.userBox}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>
          Tests: {item.tests} • Total: {item.totalScore}
        </Text>
      </View>

      <View style={styles.scoreBox}>
        <Text style={styles.avg}>{item.avgScore}</Text>
        <Text style={styles.avgLabel}>AVG</Text>
      </View>
    </View>
  );

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4f7cff" />
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
            colors={["#4f7cff"]}
            tintColor="#4f7cff"
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No leaderboard data</Text>
        }
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginVertical: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4f7cff",
    padding: 16,
    borderRadius: 25,
    marginBottom: 14,
  },
  rankBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#200303ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rank: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#ffffffff",
  },
  userBox: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffffff",
  },
  sub: {
    fontSize: 14,
    color: "#ffffffff",
    marginTop: 2,
  },
  scoreBox: {
    alignItems: "center",
  },
  avg: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffffff",
  },
  avgLabel: {
    fontSize: 12,
    color: "#ffffffff",
  },
  loader: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    color: "#ffffffff",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
});
