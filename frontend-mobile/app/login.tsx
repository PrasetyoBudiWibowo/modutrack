import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { login } from "../src/services/authService";

export default function LoginScreen() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                padding: 20,
            }}
        >
            <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>

            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                style={{
                    borderWidth: 1,
                    padding: 10,
                    marginBottom: 10,
                    borderRadius: 5,
                }}
            />

            <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={{
                    borderWidth: 1,
                    padding: 10,
                    marginBottom: 20,
                    borderRadius: 5,
                }}
            />

            <TouchableOpacity
                style={{
                    backgroundColor: "black",
                    padding: 15,
                    borderRadius: 5,
                }}
                onPress={async () => {
                    try {
                        const res = await login(username, password);

                        if (res.status === "success") {
                            alert("Login berhasil 🚀");
                            router.replace("/");
                        } else {
                            alert(res.message);
                        }

                    } catch (error) {
                        console.log("ERROR:", error);
                        alert("Terjadi kesalahan");
                    }
                }}
            >
                <Text style={{ color: "white", textAlign: "center" }}>
                    Login
                </Text>
            </TouchableOpacity>
        </View>
    );
}