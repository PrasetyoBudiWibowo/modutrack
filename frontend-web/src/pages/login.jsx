import { useState } from "react";
import api from "../service/api";

export default function Login() {
  const [result, setResult] = useState(null);

  const handleLogin = async () => {
    try {
      const res = await api.post("/login", {
        user_name: "admin",
        password: "123456",
      });

      setResult(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Login Test</h2>
      <button onClick={handleLogin}>Login</button>

      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}