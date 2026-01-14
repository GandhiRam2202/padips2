import { createDrawerNavigator } from "@react-navigation/drawer";
import { Alert } from "react-native";
import { useContext, useEffect, useState } from "react";
import HomeScreen from "../screens/home/HomeScreen";
import AdminScreen from "../screens/AdminScreen";
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
    loadUser();
  }, []);

  const loadUser = async () => {
    const storedUser = await getUser();
    setUser(storedUser);
  };

  if (!user) return null; // wait for user load

  const confirmLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
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
          backgroundColor: "rgba(0,0,0,0.76)",
          width: "40%",
          paddingTop: 40,
        },
        drawerActiveTintColor: "#f3e9e9",
        drawerInactiveTintColor: "#d60a0a",
        drawerLabelStyle: {
          fontSize: 18,
          fontWeight: "bold",
          textAlign: "center",
        },
      }}
    >
      {/* COMMON FOR ALL */}
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Home" }}
      />

      {/* 🔒 ADMIN ONLY */}
      {user.role === "admin" && (
        <Drawer.Screen
          name="AdminPanel"
          component={AdminScreen}
          options={{ title: "Admin Panel" }}
        />
      )}

      {/* LOGOUT */}
      <Drawer.Screen
        name="Logout"
        component={EmptyScreen}
        options={{
          title: "Logout",
          drawerLabelStyle: {
            color: "#e53935",
            fontWeight: "bold",
            textAlign: "center",
          },
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
