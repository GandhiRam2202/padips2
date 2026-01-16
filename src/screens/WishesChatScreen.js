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
const FESTIVAL_WISHES = [
    {
        id: "newyear",
        text: "🎉 Happy New Year!\nMay this year bring success and happiness 🎊",
        date: "01-01",
    },
    {
        id: "netaji",
        text: "🇮🇳 Remembering Netaji Subhas Chandra Bose on his birth anniversary.\nGive me blood, and I shall give you freedom!",
        date: "01-23",
    },
    {
        id: "republic",
        text: "🇮🇳 Happy Republic Day!\nLet us honour our Constitution and democracy 🇮🇳",
        date: "01-26",
    },
    {
        id: "pongal",
        text: "🌾 Happy Pongal!\nMay your life be filled with prosperity and joy 🌞",
        date: "01-15",
    },
    {
        id: "ambedkar",
        text: "📘 Remembering Dr. B. R. Ambedkar on his birth anniversary.\nEquality is the soul of democracy.",
        date: "04-14",
    },
    {
        id: "independence",
        text: "🇮🇳 Happy Independence Day!\nFreedom is our pride, unity is our strength 🇮🇳",
        date: "08-15",
    },
    {
        id: "teachers",
        text: "📚 Happy Teachers’ Day!\nA true teacher shapes the future ✨",
        date: "09-05",
    },
    {
        id: "gandhi",
        text: "🕊️ Remembering Mahatma Gandhi on his birth anniversary.\nTruth and non-violence always win.",
        date: "10-02",
    },
    {
        id: "diwali",
        text: "🪔 Happy Diwali!\nMay your life shine bright with happiness ✨",
        date: "11-01",
    },
    {
        id: "christmas",
        text: "🎄 Merry Christmas!\nMay your heart be filled with love and peace 🎁",
        date: "12-25",
    },
    {
        id: "womensday",
        text: "🌸 Happy Women's Day!\nCelebrate the strength, courage, and achievements of women everywhere 💖",
        date: "03-08",
    },
    {
        id: "constitutionday",
        text: "📜 Happy Constitution Day!\nLet us honor the values, rights, and duties enshrined in the Constitution of India 🇮🇳",
        date: "11-26",
    },
    {
        id: "nehrujayanti",
        text: "🌸 Jawaharlal Nehru Jayanti\nChildren’s Day in India",
        date: "11-14",
    },
    {
        id: "lalbahadurjayanti",
        text: "🌾 Lal Bahadur Shastri Jayanti\nJai Jawan Jai Kisan",
        date: "10-02",
    },
    {
        id: "thiruvalluvarday",
        text: "📘 Thiruvalluvar Day\nCelebrating the author of Thirukkural",
        date: "01-16",
    },
    {
        id: "kamarajarjayanti",
        text: "🏫 K. Kamarajar Jayanti\nFormer CM of Tamil Nadu",
        date: "07-15",
    },
    {
        id: "annabirthday",
        text: "🎤 C. N. Annadurai Jayanti\nFounder of DMK",
        date: "09-15",
    },
    {
        id: "labourday",
        text: "⚒️ International Labour Day (May Day)",
        date: "05-01",
    },
    {
        id: "environmentday",
        text: "🌱 World Environment Day\nProtect nature and environment",
        date: "06-05",
    },
    {
  id: "bhagatsinghbirthday",
  text: "🔥 Bhagat Singh Jayanti\nBirth anniversary of revolutionary freedom fighter Bhagat Singh",
  date: "09-28",
},
{
  id: "velunachiyar",
  text: "⚔️ Rani Velu Nachiyar Birthday\nBirth anniversary of the first Indian queen who fought the British 🇮🇳",
  date: "01-03",
},


];


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

            {/* 💬 MESSAGE */}
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.messageBubble}>
                        <Text style={styles.messageText}>{item.text}</Text>
                    </View>
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#FFD700"]}
                        tintColor="#FFD700"
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
        backgroundColor: "#000",
    },

    fireworks: {
        position: "absolute",
        width,
        height,
        top: 0,
        left: 0,
        zIndex: 0,
        opacity: 0.55, // 🔥 SOFT FIREWORKS
    },

    messageBubble: {
        backgroundColor: "rgba(26,26,26,0.85)",
        padding: 20,
        borderRadius: 14,
        marginBottom: 14,
        marginHorizontal: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#FFD700",
        zIndex: 2,
    },

    messageText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        lineHeight: 26,
        textAlign: "center",
    },
});
