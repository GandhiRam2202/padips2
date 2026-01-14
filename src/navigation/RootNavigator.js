import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import Loader from "../components/Loader";
import AppDrawer from "./AppDrawer";
import AuthStack from "./AuthStack";


export default function RootNavigator() {
  const { token, loading } = useContext(AuthContext);
  if (loading) return <Loader />;
  return token ? <AppDrawer /> : <AuthStack />;
}
