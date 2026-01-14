import { View, ActivityIndicator } from "react-native";

export default function Loader() {
  return (
    <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
