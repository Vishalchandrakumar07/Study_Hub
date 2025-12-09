"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateAdminLogin } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateAdminLogin(email, password)) {
      document.cookie = "admin-auth=true; path=/";
      router.push("/admin/dashboard");
    } else {
      alert("Invalid admin credentials");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Admin Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br/>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br/>

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
