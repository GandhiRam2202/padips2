import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DeveloperProfile() {
  const openLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* DEVOTIONAL HEADER */}
      <View style={styles.frame}>
        <Image
          source={require("../../../assets/vel.png")}
          style={styles.velImage}
        />

        <View style={styles.textBox}>
          <Text style={styles.aruname}>ஆறுமுகம் அருளிடும்</Text>
          <Text style={styles.aruname}>அனுதினமும் ஏறுமுகம்</Text>
        </View>

        <Image
          source={require("../../../assets/vel.png")}
          style={styles.velImage}
        />
      </View>

      {/* PROFILE CARD */}
      <View style={styles.card}>
        <Image
          source={require("../../../assets/dev.jpeg")}
          style={styles.avatar}
        />

        <Text style={styles.name}>Parthiban</Text>
        <Text style={styles.role}>Full Stack Developer</Text>

        <Text style={styles.bio}>
          Passionate developer building scalable mobile and web applications
        </Text>
        <Text style={styles.bio}>
          React • React Native • Node.js • MongoDB • Bootstrap
        </Text>

        {/* SOCIAL LINKS */}
        <View style={styles.links}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              openLink("https://www.instagram.com/ksarts.frames/")
            }
          >
            <Ionicons
              name="logo-instagram"
              size={26}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              openLink(
                "https://www.linkedin.com/in/parthiban-ramachandiran/"
              )
            }
          >
            <Ionicons
              name="logo-linkedin"
              size={26}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* =====================
        STYLES
===================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },

  /* DEVOTIONAL FRAME */
  frame: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFD700",
    borderRadius: 50,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#08d928ff",
},
velImage: {
    width: 36,
    height: 36,
    resizeMode: "contain",
},
textBox: {
    paddingHorizontal: 14,
    alignItems: "center",
  },
  aruname: {
    color: "#255327ff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },

  /* PROFILE CARD */
  card: {
    width: "100%",
    backgroundColor: "#ffffffff",
    borderRadius: 26,
    padding: 22,
    alignItems: "center",
  },
  avatar: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginTop: 6,
},
role: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4f7cff",
    marginBottom: 12,
},
bio: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 15,
    color: "#444",
    marginBottom: 6,
  },

  /* LINKS */
  links: {
    flexDirection: "row",
    gap: 40,
    marginTop: 20,
  },
  iconButton: {
    backgroundColor: "#4f7cff",
    padding: 14,
    borderRadius: 50,
  },
});
