import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔐 TOKEN
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem("token", token);
    return true;
  } catch (e) {
    console.log("Save token failed", e);
    return false;
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem("token");
  } catch (e) {
    console.log("Get token failed", e);
    return null;
  }
};

// 👤 USER
export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem("user", JSON.stringify(user));
    return true;
  } catch (e) {
    console.log("Save user failed", e);
    return false;
  }
};

export const getUser = async () => {
  try {
    const data = await AsyncStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.log("Get user failed", e);
    return null;
  }
};

// 🚪 LOGOUT / CLEAR
export const clearSession = async () => {
  try {
    await AsyncStorage.multiRemove(["token", "user"]);
    return true;
  } catch (e) {
    console.log("Clear session failed", e);
    return false;
  }
};
