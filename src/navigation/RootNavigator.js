import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import AuthStack from "./AuthStack";
import AppDrawer from "./AppDrawer";

export default function RootNavigator() {
  const { token, loading } = useContext(AuthContext);

  if (loading) return null;

  // ❌ NO NavigationContainer here
  return token ? <AppDrawer /> : <AuthStack />;
}
