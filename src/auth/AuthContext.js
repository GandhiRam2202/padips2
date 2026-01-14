import { createContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { getToken, getUser, saveToken, clearSession } from "../utils/storage";
import { socket } from "../socket/socket";

export const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* LOAD SESSION */
  useEffect(() => {
    (async () => {
      const t = await getToken();
      const u = await getUser();

      if (t && u) {
        setToken(t);
        setUser(u);

        socket.connect();
        socket.emit("join", u._id); // ✅ CORRECT
      }

      setLoading(false);
    })();
  }, []);

  /* FORCE LOGOUT */
  useEffect(() => {
    if (!token) return;

    const handler = async (data) => {
      await clearSession();
      setToken(null);
      setUser(null);

      Alert.alert(
        data.type === "blocked" ? "Account Blocked" : "Account Suspended",
        data.reason || "Access revoked"
      );
    };

    socket.on("forceLogout", handler);
    return () => socket.off("forceLogout", handler);
  }, [token]);

  const login = async (token, user) => {
    await saveToken(token);
    await saveUser(user);

    setToken(token);
    setUser(user);

    socket.connect();
    socket.emit("join", user._id); // ✅ THIS WAS MISSING
  };

  const logout = async () => {
    socket.disconnect();
    await clearSession();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

