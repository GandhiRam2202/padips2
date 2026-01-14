import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { AuthProvider } from "./src/auth/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";
import toastConfig from "./toastConfig";
import { StatusBar } from "expo-status-bar";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
          <Toast
        config={toastConfig}
        position="top"
        topOffset={60}
      />
      </AuthProvider>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  )

}
         