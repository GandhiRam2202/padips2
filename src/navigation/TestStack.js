import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TestScreen from "../screens/TEST";
import TestQuestionScreen from "../screens/TestQuestionScreen";
import LearnQuestionsScreen from "../screens/home/LearnQuestionsScreen";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Stack = createNativeStackNavigator();

export default function TestStack() {
    return (
        <Stack.Navigator>
            {/* 🚫 NO HEADER HERE (Drawer already has it) */}
            <Stack.Screen
                name="TEST"
                component={TestScreen}
                options={({ navigation }) => ({
                    headerShown: true,
                    title: "📝 Tests",
                    headerTitleStyle: {
                        fontWeight: "bold",
                        fontSize: 22,
                    },
                    headerTintColor: "#000000ff",

                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => navigation.getParent()?.openDrawer()}
                        >
                            <Ionicons name="menu" size={26} color="#000000ff" />
                        </TouchableOpacity>
                    ),
                })}
            />

            {/* ❌ TEST QUESTIONS → HIDE DRAWER HEADER */}
            <Stack.Screen
                name="TestQuestion"
                component={TestQuestionScreen}
                options={{
                    headerShown: true,
                    title: "📝 Test Questions",
                    headerTitleStyle: {
                        fontWeight: "bold",
                        fontSize: 22,
                    },
                    headerTintColor: "#000000ff",
                    headerBackVisible: true,
                }}
            />

            <Stack.Screen
                name="LearnQuestions"
                component={LearnQuestionsScreen}
                options={{
                    title: "Learn Questions",
                    headerShown: true,
                    headerStyle: { backgroundColor: "#000" },
                    headerTintColor: "#fff",
                    headerTitleStyle: { fontWeight: "bold" },
                }}
            />
        </Stack.Navigator>
    );
}
