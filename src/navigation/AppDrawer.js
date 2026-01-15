import { createDrawerNavigator } from "@react-navigation/drawer";
import TestStack from "./TestStack";
import AdminScreen from "../screens/AdminScreen";
import BlockedUsersScreen from "../screens/BlockedUsersScreen";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../auth/AuthContext";
import { getUser } from "../utils/storage";
import { Alert } from "react-native";
import HomeStack from "./HomeStack";

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
                headerStyle: { backgroundColor: "#000" },
                headerTintColor: "#fff",

                drawerStyle: {
                    backgroundColor: "rgba(0,0,0,0.75)",
                    width: "45%",
                },

                // ✅ DRAWER TEXT COLOR
                drawerActiveTintColor: "#ffffff",     // selected item text
                drawerInactiveTintColor: "#ffffff",   // normal item text

                // ✅ OPTIONAL: make text bold & centered
                drawerLabelStyle: {
                    fontSize: 16,
                    fontWeight: "bold",
                    textAlign: "center",
                },
            }}
        >

            <Drawer.Screen
                name="Home"
                component={HomeStack}
                options={{ headerShown: true }}
            />
            <Drawer.Screen
                name="Tests"
                component={TestStack}
                options={{
                    headerShown: false,
                    title: "Tests",
                }}
            />

            {user.role === "admin" && (
                <Drawer.Screen name="AdminPanel" component={AdminScreen} />
            )}

            <Drawer.Screen
                name="BlockedUsers"
                component={BlockedUsersScreen}
                options={{ drawerItemStyle: { display: "none" } }}
            />

            <Drawer.Screen
                name="Logout"
                component={EmptyScreen}
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
