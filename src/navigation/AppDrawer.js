import { createDrawerNavigator } from "@react-navigation/drawer";
import { useContext, useEffect, useState } from "react";
import { Alert } from "react-native";

import TestStack from "./TestStack";
import HomeStack from "./HomeStack";

import AdminScreen from "../screens/AdminScreen";
import BlockedUsersScreen from "../screens/BlockedUsersScreen";
import LeaderBoardScreen from "../screens/home/LeaderBoardScreen";
import FeedbackScreen from "../screens/home/FeedbackScreen";
import DeveloperProfile from "../screens/home/DeveloperProfile";
import ProfileScreen from "../screens/home/ProfileScreen";
import WishesChatScreen from "../screens/WishesChatScreen";

import { AuthContext } from "../auth/AuthContext";
import { getUser } from "../utils/storage";

const Drawer = createDrawerNavigator();

function EmptyScreen() {
    return null;
}

export default function AppDrawer() {
    const { logout } = useContext(AuthContext);
    const [user, setUser] = useState(null);

    useEffect(() => {
        getUser().then(setUser);
    }, []);

    if (!user) return null;

    const confirmLogout = () => {
        Alert.alert("Logout", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", style: "destructive", onPress: logout },
        ]);
    };

    return (
        <Drawer.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: "#ffffffff",
                },
                headerTintColor: "#000000ff",

                /* DRAWER PANEL */
                drawerStyle: {
                    backgroundColor: "rgba(255, 255, 255, 0.55)",
                    width: "65%",
                    paddingTop: 40,
                    width: "50%"
                },

                /* DRAWER TEXT */
                drawerActiveTintColor: "#ffffffff",
                drawerInactiveTintColor: "#000000ff",

                drawerLabelStyle: {
                    fontSize: 18,
                    fontWeight: "bold",
                    textAlign: "center"
                },

                drawerItemStyle: {
                    borderRadius: 12,
                    marginHorizontal: 10,
                    marginVertical: 4,
                },

                drawerActiveBackgroundColor: "#4f7cff",
            }}
        >
            {/* HOME */}
            <Drawer.Screen
                name="🏠 Home"
                component={HomeStack}
                options={{
                    title: "🏠 Home",
                    headerShown: true,
                    headerTitleStyle: {
                        fontWeight: "bold",
                        fontSize: 22,
                    },
                }}
            />

            {/* TESTS */}
            <Drawer.Screen
                name="Tests"
                component={TestStack}
                options={{
                    title: "📝 Tests",
                    headerShown: false,
                }}
            />

            {/* LEADERBOARD */}
            <Drawer.Screen
                name="LeaderBoard"
                component={LeaderBoardScreen}
                options={{
                    title: "🏆 Leader Board",
                    headerTitleStyle: {
                        fontWeight: "bold",
                        fontSize: 22,
                    },
                }}
            />

            {/* PROFILE */}
            <Drawer.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: "👤 Profile",
                    headerTitleStyle: {
                        fontWeight: "bold",
                        fontSize: 22,
                    },
                }}
            />

            {/* WISHES */}
            <Drawer.Screen
                name="Wishes"
                component={WishesChatScreen}
                options={{
                    title: "🎉 Wishes",
                    headerTitleStyle: {
                        fontWeight: "bold",
                    },
                }}
            />

            {/* FEEDBACK */}
            <Drawer.Screen
                name="Feedback"
                component={FeedbackScreen}
                options={{
                    title: "💬 Feedback",
                    headerTitleStyle: {
                        fontWeight: "bold",
                        fontSize: 22,
                    },
                }}
            />

            {/* DEVELOPER */}
            <Drawer.Screen
                name="Developer"
                component={DeveloperProfile}
                options={{
                    title: "👨‍💻 Developer",
                    headerTitleStyle: {
                        fontWeight: "bold",
                        fontSize: 22,
                    },
                }}
            />

            {/* ADMIN (ROLE BASED) */}
            {user.role === "admin" && (
                <Drawer.Screen
                    name="AdminPanel"
                    component={AdminScreen}
                    options={{
                        title: "🛠 Admin Panel",
                        headerTitleStyle: {
                            fontWeight: "bold",
                            fontSize: 22,
                        }

                    }}
                />
            )}

            {/* HIDDEN ROUTES */}
            <Drawer.Screen
                name="BlockedUsers"
                component={BlockedUsersScreen}
                options={{
                    drawerItemStyle: { display: "none" },
                    title: "📵 Blocked User",
                    headerTitleStyle: {
                        fontWeight: "bold",
                        fontSize: 22,
                    }
                }}
            />

            {/* LOGOUT */}
            <Drawer.Screen
                name="Logout"
                component={EmptyScreen}
                options={{
                    title: "🚪 Logout",
                }}
                listeners={{
                    drawerItemPress: (e) => {
                        e.preventDefault();
                        confirmLogout();
                    },
                }}
            />
        </Drawer.Navigator>
    );
}
