import { createContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { getToken, getUser, saveToken, saveUser, clearSession } from "../utils/storage";
import { socket } from "../socket/socket";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =====================
     LOAD SESSION ON START
  ====================== */
  useEffect(() => {
    (async () => {
      const storedToken = await getToken();
      const storedUser = await getUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);

        socket.connect();
        socket.emit("join", storedUser._id); // ✅ MUST BE _id
      }

      setLoading(false);
    })();
  }, []);

  /* =====================
     🔥 FORCE LOGOUT (PUT HERE)
  ====================== */
  useEffect(() => {
    if (!token) return;

    const handler = async (data) => {

      await logout(); // ✅ THIS RUNS NOW

      Alert.alert(
        data.type === "blocked" ? "Account Blocked" : "Account Suspended",
        data.reason || "Your access has been restricted"
      );
    };

    socket.on("forceLogout", handler);

    return () => {
      socket.off("forceLogout", handler);
    };
  }, [token]);

  /* =====================
     LOGIN
  ====================== */
  const login = async (newToken, userData) => {
    await saveToken(newToken);
    await saveUser(userData);

    setToken(newToken);
    setUser(userData);

    socket.connect();
    socket.emit("join", userData._id); // ✅ SAME ROOM ID
  };

  /* =====================
     LOGOUT
  ====================== */
  const logout = async () => {
    socket.disconnect();
    await clearSession();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
