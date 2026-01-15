import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";


export default function DeveloperProfile() {
    const openLink = (url) => {
        Linking.openURL(url);
    };

    return (
        <View style={styles.container}>
            {/* Avatar */}
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


            <Image
                source={require("../../../assets/dev.jpeg")}
                style={styles.avatar}
            />



            {/* Name */}
            <Text style={styles.name}>Parthiban</Text>

            {/* Role */}
            <Text style={styles.role}>Full Stack Developer</Text>

            {/* Bio */}
            <Text style={styles.bio}>
                Passionate developer building scalable mobile and web applications
                using
            </Text>
            <Text style={styles.bio}>
                React, React Native, Nodejs, Mongo DB, Bootstrap
            </Text>
           
            {/* Social Links */}
            <View style={styles.links}>

                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => openLink("https://www.instagram.com/ksarts.frames/")}
                >
                    <Ionicons name="logo-instagram" size={30} color="#fff" />
        
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => openLink("https://www.linkedin.com/in/parthiban-ramachandiran/")}
                >
                    <Ionicons name="logo-linkedin" size={30} color="#fff" />
        
                </TouchableOpacity>
            </View>

        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: 20,
        backgroundColor: "#000000ff",
    },
    avatar: {
        width: 220,
        height: 220,
        borderRadius: 200,
        marginTop: 20
    },
    name: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#ffffffff",
        marginTop: 15,
    },
    role: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#ffffffff",
        marginBottom: 15,
    },
    bio: {
        textAlign: "center",
        fontWeight: "bold",
        fontSize: 18,
        color: "#ffffffff",
        marginBottom: 20,
    },
    links: {
        flexDirection: "row",
        color: "#ffffffff",
        gap: 75,
    },
    iconButton: {
        alignItems: "center",
        backgroundColor: "#7b0f0fff",
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderRadius: 50,
    },


    velImage: {
        width: 40,
        height: 40,
        resizeMode: "contain",
    },

    frame: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: "#FFD700",
        borderRadius: 50,
        paddingVertical: 2,
        paddingHorizontal: 15,
        margin: 5,
        backgroundColor: "#000",
        backgroundColor:"#043b0cff"
    },

    textBox: {
        paddingHorizontal: 12,
        alignItems: "center",
    },

    aruname: {
        color: "#ddff00ff",
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 4,
    },


});
