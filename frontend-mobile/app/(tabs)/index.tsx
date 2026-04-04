import { Text, View, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Home Screen 🚀</Text>

      <Link href="/login" asChild>
        <TouchableOpacity
          style={{
            marginTop: 20,
            backgroundColor: "black",
            padding: 12,
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "white" }}>
            Ke Login
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}