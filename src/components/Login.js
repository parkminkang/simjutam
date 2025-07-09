import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

function Login({ onLogin }) {
  const [inputId, setInputId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!inputId || !password) {
      alert("학번 또는 교직원 ID와 비밀번호를 모두 입력하세요.");
      return;
    }

    const trimmedId = inputId.trim();
    const email = trimmedId.includes("@")
      ? trimmedId
      : `${trimmedId}@simjutam.com`;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
         alert("로그인 성공!");
        const userType = trimmedId.startsWith("T-") ? "teacher" : "student";
        localStorage.setItem("studentId", trimmedId);
        localStorage.setItem("userType", userType);
        onLogin(trimmedId);
      })
      .catch((error) => {
        alert("로그인 실패: " + error.message);
      });
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>빈 교실 좌석 예약 시스템</h2>

        <input
          type="text"
          placeholder="학번 또는 교직원 ID"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleLogin} style={styles.button}>
          로그인
        </button>
      </div>
    </div>
  );
}

const baseHeight = "44px"; // 기준 높이 설정

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #cceeff, #e0f7fa)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "360px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "30px",
    color: "#0077cc",
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: baseHeight,
    padding: "0 12px",
    marginBottom: "15px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    height: baseHeight,
    backgroundColor: "#0077cc",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Login;
