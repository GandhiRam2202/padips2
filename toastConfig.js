import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { useEffect, useRef } from "react";

const { width } = Dimensions.get("window");

function SlideToast({ text1, text2, bgColor }) {
  const translateX = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: bgColor, transform: [{ translateX }] },
      ]}
    >
      <Text style={styles.text1}>{text1}</Text>
      {text2 ? <Text style={styles.text2}>{text2}</Text> : null}
    </Animated.View>
  );
}

const toastConfig = {
  success: (props) => (
    <SlideToast {...props} bgColor="#1b8f2a" />
  ),
  info: (props) => (
    <SlideToast {...props} bgColor="#1b8f2a" />
  ),
  error: (props) => (
    <SlideToast {...props} bgColor="#e53935" />
  ),
};

export default toastConfig;

const styles = StyleSheet.create({
  toast: {
    width: "90%",
    minHeight: 80,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignSelf: "center",
    justifyContent: "center",
    marginTop: 10,
    elevation: 5,
  },
  text1: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  text2: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    marginTop: 4,
  },
});
