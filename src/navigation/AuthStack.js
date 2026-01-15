import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../auth/LoginScreen";
import RegisterScreen from "../auth/RegisterScreen";
import ForgotPasswordScreen from "../auth/ForgotPasswordScreen";
import ResetPasswordScreen from "../auth/ResetPasswordScreen";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
