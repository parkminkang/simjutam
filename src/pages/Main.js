import React, { useState } from "react";
import { database } from "../firebase";
import { ref, set } from "firebase/database";
import SeatReservation from "../components/SeatReservation";

function Main() {
  const [seat, setSeat] = useState("");
  const studentId = localStorage.getItem("studentId"); // ← 여기!

  const handleReserve = () => {
    if (!studentId) {
      alert("로그인이 필요합니다");
      return;
    }

    set(ref(database, "reservations/" + studentId), {
      seat: seat,
      timestamp: Date.now()
    }).then(() => {
      alert("예약 완료!");
    });
  };

  return (
    <div>
      <h2>좌석 예약</h2>
      <p><strong>내 학번:</strong> {studentId}</p>
      <h1>빈 교실 예약 시스템 메인</h1>
      <SeatReservation />
    </div>
  );
}

export default Main;
