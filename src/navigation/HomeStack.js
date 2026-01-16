import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/home/HomeScreen";
import LearnQuestionsScreen from "../screens/home/LearnQuestionsScreen";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainApp"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LearnQuestions"
        component={LearnQuestionsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
