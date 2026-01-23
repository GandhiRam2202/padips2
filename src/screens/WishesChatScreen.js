import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import LottieView from "lottie-react-native";
import api from "../api/axios";

const { width, height } = Dimensions.get("window");

/* 🇮🇳 IMPORTANT INDIAN DAYS & OBSERVANCES (MASTER LIST – FIXED DATES) */
const FESTIVAL_WISHES = [

  // ===================== JANUARY =====================
  { id: "new_year", date: "01-01", title: "New Year", text: "🎆 Happy New Year!\n\nA fresh start and new hopes.", color: "#4f7cff" },

  { id: "national_youth_day", date: "01-12", title: "National Youth Day", text: "🔥 National Youth Day!\n\nArise, awake, and stop not till the goal is reached.", color: "#FF5722" },

  { id: "army_day", date: "01-15", title: "Indian Army Day", text: "🪖 Indian Army Day!\n\nSaluting our brave soldiers.", color: "#4CAF50" },

  { id: "netaji_jayanti", date: "01-23", title: "Netaji Subhas Chandra Bose Jayanti (Parakram Diwas)", text: "🕊️ Remembering Netaji and his fearless spirit. Jai Hind!", color: "#1B5E20" },

  { id: "republic_day", date: "01-26", title: "Republic Day", text: "🇮🇳 Happy Republic Day!\n\nHonoring our Constitution. Jai Hind!", color: "#FF9933" },

  { id: "martyrs_day", date: "01-30", title: "Martyrs’ Day", text: "🕯️ Remembering the martyrs who sacrificed for India.", color: "#6D4C41" },

  // ===================== FEBRUARY =====================
  { id: "world_cancer_day", date: "02-04", title: "World Cancer Day", text: "🎗️ Together we fight cancer.", color: "#9C27B0" },

  { id: "national_womens_day", date: "02-13", title: "National Women’s Day (India)", text: "🌸 Celebrating women leaders of India.", color: "#E91E63" },

  { id: "valentines_day", date: "02-14", title: "Valentine’s Day", text: "❤️ Celebrating love and togetherness.", color: "#F44336" },

  { id: "national_science_day", date: "02-28", title: "National Science Day", text: "🔬 Science for progress and innovation.", color: "#1976D2" },

  // ===================== MARCH =====================
  { id: "international_womens_day", date: "03-08", title: "International Women’s Day", text: "👩 Happy Women’s Day!\n\nEquality and empowerment.", color: "#D81B60" },

  { id: "world_water_day", date: "03-22", title: "World Water Day", text: "💧 Save water, secure future.", color: "#2196F3" },

  // ===================== APRIL =====================
  { id: "world_health_day", date: "04-07", title: "World Health Day", text: "🩺 Health is the greatest wealth.", color: "#009688" },

  { id: "ambedkar_jayanti", date: "04-14", title: "Dr. B. R. Ambedkar Jayanti", text: "📘 Remembering the architect of the Constitution.", color: "#3F51B5" },

  { id: "fire_service_day", date: "04-14", title: "Fire Service Day", text: "🚒 Honoring our fire fighters.", color: "#E53935" },

  { id: "earth_day", date: "04-22", title: "Earth Day", text: "🌍 Protect our only home.", color: "#4CAF50" },

  // ===================== MAY =====================
  { id: "labour_day", date: "05-01", title: "Labour Day", text: "🛠️ Respect to all workers.", color: "#795548" },

  { id: "press_freedom_day", date: "05-03", title: "World Press Freedom Day", text: "📰 Free press, strong democracy.", color: "#455A64" },

  { id: "mothers_day", date: "05-10", title: "Mother’s Day", text: "🤱 A mother’s love is endless.", color: "#E91E63" },

  // ===================== JUNE =====================
  { id: "environment_day", date: "06-05", title: "World Environment Day", text: "🌱 Act now for a greener future.", color: "#2E7D32" },

  { id: "yoga_day", date: "06-21", title: "International Yoga Day", text: "🧘 Yoga for harmony and peace.", color: "#009688" },

  // ===================== JULY =====================
  { id: "doctors_day", date: "07-01", title: "National Doctors Day", text: "🩺 Thank you doctors for saving lives.", color: "#0288D1" },

  // ===================== AUGUST =====================
  { id: "friendship_day", date: "08-02", title: "Friendship Day", text: "🤝 Friends make life beautiful.", color: "#FF9800" },

  { id: "independence_day", date: "08-15", title: "Independence Day", text: "🇮🇳 Freedom is our pride.", color: "#138808" },

  { id: "sadbhavana_diwas", date: "08-20", title: "Sadbhavana Diwas", text: "🕊️ Promoting peace and harmony.", color: "#607D8B" },

  { id: "national_sports_day", date: "08-29", title: "National Sports Day", text: "🏏 Celebrating sportsmanship.", color: "#2E7D32" },

  // ===================== SEPTEMBER =====================
  { id: "teachers_day", date: "09-05", title: "Teachers Day", text: "📚 Guiding minds, shaping futures.", color: "#5D4037" },

  { id: "engineers_day", date: "09-15", title: "Engineers Day", text: "⚙️ Innovate. Build. Inspire.", color: "#607D8B" },

  { id: "world_heart_day", date: "09-29", title: "World Heart Day", text: "❤️ Care for your heart.", color: "#C62828" },

  // ===================== OCTOBER =====================
  { id: "gandhi_jayanti", date: "10-02", title: "Gandhi Jayanti", text: "👓 Truth and non-violence.", color: "#1A237E" },

  { id: "airforce_day", date: "10-08", title: "Indian Air Force Day", text: "✈️ Touch the sky with glory.", color: "#1565C0" },

  // ===================== NOVEMBER =====================
  { id: "childrens_day", date: "11-14", title: "Children’s Day", text: "🧒 Every child is the future.", color: "#FB8C00" },

  { id: "constitution_day", date: "11-26", title: "Constitution Day", text: "📜 Upholding constitutional values.", color: "#283593" },

  // ===================== DECEMBER =====================
  { id: "navy_day", date: "12-04", title: "Indian Navy Day", text: "⚓ Saluting our naval forces.", color: "#0D47A1" },

  { id: "human_rights_day", date: "12-10", title: "Human Rights Day", text: "🕊️ Equality, dignity, justice.", color: "#6A1B9A" },

  { id: "christmas", date: "12-25", title: "Christmas", text: "🎄 Merry Christmas!\n\nPeace and joy to all.", color: "#C62828" },

];


/* 📅 Helper → MM-DD */
const getMMDD = (date) => {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
};

export default function WishesChatScreen() {
  const [messages, setMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFireworks, setShowFireworks] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);

    const todayMMDD = getMMDD(new Date()); // 📱 DEVICE DATE (IST safe)
    let msgs = [];
    let celebration = false;

    /* 🌍 GLOBAL BIRTHDAYS (ALL USERS → FILTER LOCALLY) */
    try {
      const response = await api.get("/birthdays-today");

      const users = response.data?.data || [];

      if (Array.isArray(users) && users.length > 0) {
        users.forEach((user) => {
          if (!user.dob) return;

          const dobDate = new Date(user.dob); // works for string & Date
          const dobMMDD = getMMDD(dobDate);

          if (dobMMDD === todayMMDD) {
            celebration = true;
            msgs.push({
              id: `bday-${user._id}`,
              text: `🎂 🎉 Happy Birthday ${user.name}! 💖\n\nHave a wonderful year ahead! ✨`,
              color: "#9C27B0",
            });
          }
        });
      }
    } catch (error) {
      console.log("❌ API ERROR:", error.message);
    }

    /* 🇮🇳 INDIAN / NATIONAL DAYS */
    FESTIVAL_WISHES.forEach((f) => {
      if (f.date === todayMMDD) {
        celebration = true;
        msgs.push({
          id: f.id,
          text: f.text,
          color: f.color,
        });
      }
    });

    /* 👋 DEFAULT MESSAGE */
    if (msgs.length === 0) {
      msgs.push({
        id: "welcome",
        text: "👋 Welcome to PADIPS2 Wishes 🎉\n\nNo celebrations today.\nCome back tomorrow! 💖",
        color: "#4f7cff",
      });
    }

    setMessages(msgs);
    setShowFireworks(celebration);
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  }, []);

  return (
    <>
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {showFireworks && (
        <LottieView
        source={require("../../assets/Fireworks.json")}
        autoPlay
        loop
        style={styles.fireworks}
        />
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4f7cff" />
        </View>
      ) : (
        <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.messageCard, { backgroundColor: item.color }]}>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
          />
        )}
    </View>
   
        </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  fireworks: { position: "absolute", width, height, opacity: 0.45 },
  listContent: { paddingVertical: 60, paddingHorizontal: 20 },
  messageCard: {
    padding: 25,
    borderRadius: 30,
    marginBottom: 20,
    elevation: 0,
  },
  messageText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 30,
  },
});
