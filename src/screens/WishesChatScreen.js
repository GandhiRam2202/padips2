import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
} from "react-native";
import LottieView from "lottie-react-native";
import { getUser } from "../utils/storage";

const { width, height } = Dimensions.get("window");

/* 🎉 PREDEFINED FESTIVAL WISHES */
const FESTIVAL_WISHES = [ /* ⬅️ SAME AS YOUR CODE (UNCHANGED) */ ];

export default function WishesChatScreen() {
  const [messages, setMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    const user = await getUser();
    const today = new Date();
    const todayStr = formatDate(today);

    let msgs = [];
    let celebration = false;

    /* 🎂 Birthday Wish */
    if (user?.dob) {
      const dob = new Date(user.dob);
      if (
        dob.getDate() === today.getDate() &&
        dob.getMonth() === today.getMonth()
      ) {
        celebration = true;
        msgs.push({
          id: "birthday",
          text: `🎂 Happy Birthday 🎉\n\n${user.name}\n\nMay your dreams come true and success follow you always 💖`,
        });
      }
    }

    /* 🎊 Festival Wishes */
    FESTIVAL_WISHES.forEach((f) => {
      if (f.date === todayStr) {
        celebration = true;
        msgs.push({
          id: f.id,
          text: f.text,
        });
      }
    });

    /* 👋 Default */
    if (msgs.length === 0) {
      msgs.push({
        id: "welcome",
        text: "👋 Welcome to PADIPS2 Wishes 🎉\nCome back on your special day 💖",
      });
    }

    setShowFireworks(celebration);
    setMessages(msgs);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  }, []);

  const formatDate = (d) => {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${mm}-${dd}`;
  };

  return (
    <View style={styles.container}>
      {/* 🎆 BACKGROUND FIREWORKS */}
      {showFireworks && (
        <LottieView
          source={require("../../assets/Fireworks.json")}
          autoPlay
          loop
          resizeMode="cover"
          style={styles.fireworks}
        />
      )}

      {/* 💬 MESSAGES */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4f7cff"]}
            tintColor="#4f7cff"
          />
        }
        contentContainerStyle={{ paddingVertical: 40 }}
      />
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  fireworks: {
    position: "absolute",
    width,
    height,
    top: 0,
    left: 0,
    zIndex: 0,
    opacity: 0.25, // 🌈 SOFT, PREMIUM
  },

  messageCard: {
    backgroundColor: "#4f7cff",
    padding: 22,
    borderRadius: 22,
    marginBottom: 16,
    marginHorizontal: 20,
    zIndex: 2,
  },

  messageText: {
    color: "#ffffffff",
    fontSize: 22,
    fontWeight: "bold",
    lineHeight: 26,
    textAlign: "center",
  },
});
