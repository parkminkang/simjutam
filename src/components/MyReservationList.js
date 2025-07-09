import React, { useEffect, useState } from "react";
import { ref, onValue, remove, update } from "firebase/database";
import { database } from "../firebase";

const classroomLayout = {
  "수학전용실": { rows: 3, cols: 4 },
  "수학미디어스페이스실": { rows: 2, cols: 5 },
  "홈베이스": { rows: 6, cols: 3 },
};

function MyReservationList({ studentId, onBack }) {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const allRef = ref(database, "reservedSeats");
    onValue(allRef, (snapshot) => {
      const data = snapshot.val();
      const result = [];

      if (data) {
        Object.entries(data).forEach(([time, classrooms]) => {
          Object.entries(classrooms).forEach(([classroomName, seats]) => {
            const allSeats = Object.entries(seats);
            const mySeats = allSeats.filter(([_, id]) => id === studentId);

            const layout = classroomLayout[classroomName];
            const totalSeats = layout.rows * layout.cols;

            if (mySeats.length === totalSeats) {
              result.push({
                type: "full",
                time,
                classroomName,
              });
            } else {
              mySeats.forEach(([seatId]) => {
                result.push({
                  type: "seat",
                  time,
                  classroomName,
                  seatId,
                });
              });
            }
          });
        });
      }

      setReservations(result);
    });
  }, [studentId]);

  const handleCancel = (res) => {
    if (res.type === "full") {
      const layout = classroomLayout[res.classroomName];
      const updates = {};

      for (let r = 0; r < layout.rows; r++) {
        for (let c = 1; c <= layout.cols; c++) {
          const seatId = String.fromCharCode(65 + r) + c;
          updates[`reservedSeats/${res.time}/${res.classroomName}/${seatId}`] = null;
        }
      }

      update(ref(database), updates)
        .then(() => {
          alert("교실 전체 예약이 취소되었습니다.");
          setReservations((prev) =>
            prev.filter(
              (r) =>
                !(
                  r.type === "full" &&
                  r.classroomName === res.classroomName &&
                  r.time === res.time
                )
            )
          );
        })
        .catch((err) => {
          alert("전체 취소 중 오류: " + err.message);
        });
    } else {
      const seatRef = ref(
        database,
        `reservedSeats/${res.time}/${res.classroomName}/${res.seatId}`
      );
      remove(seatRef)
        .then(() => {
          alert("좌석 예약이 취소되었습니다.");
          setReservations((prev) =>
            prev.filter(
              (r) =>
                !(
                  r.classroomName === res.classroomName &&
                  r.time === res.time &&
                  r.seatId === res.seatId
                )
            )
          );
        })
        .catch((err) => {
          alert("취소 중 오류: " + err.message);
        });
    }
  };

  // ===== 디자인 시작 =====

  const mainBlue = "#3b82f6";
  const darkBlue = "#1e40af";
  const lightBlue = "#eff6ff";

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "40px auto",
        padding: 24,
        backgroundColor: "white",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(59,130,246,0.2)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#1e293b",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2 style={{ margin: 0, color: darkBlue }}>내 예약 목록</h2>
        <button
          onClick={onBack}
          style={{
            backgroundColor: mainBlue,
            color: "white",
            border: "none",
            borderRadius: 10,
            padding: "10px 18px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.25s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = darkBlue)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = mainBlue)}
          aria-label="뒤로가기"
        >
          ← 돌아가기
        </button>
      </header>

      {reservations.length === 0 ? (
        <p style={{ fontSize: 16, color: "#64748b" }}>예약한 좌석이 없습니다.</p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            paddingLeft: 0,
            maxHeight: 320,
            overflowY: "auto",
          }}
        >
          {reservations.map((res, idx) => (
            <li
              key={idx}
              style={{
                marginBottom: 14,
                padding: "12px 16px",
                backgroundColor: lightBlue,
                borderRadius: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: 15,
                fontWeight: 600,
                color: darkBlue,
                userSelect: "none",
              }}
            >
              <span>
                [{res.classroomName}] {res.time} -{" "}
                {res.type === "full" ? "교실 전체 예약" : res.seatId}
              </span>

              <button
                onClick={() => handleCancel(res)}
                style={{
                  marginLeft: 12,
                  padding: "6px 14px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: "700",
                  userSelect: "none",
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b91c1c")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
                aria-label={`예약 취소 ${res.classroomName} ${res.time} ${
                  res.type === "full" ? "교실 전체" : res.seatId
                }`}
              >
                취소
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MyReservationList;
