import React, { useState, useEffect } from "react";
import { ref, onValue, remove } from "firebase/database";
import { database } from "../firebase";

const classrooms = [
  { name: "수학전용실", rows: 3, cols: 4 },
  { name: "수학미디어스페이스실", rows: 2, cols: 5 },
  { name: "홈베이스", rows: 6, cols:3 },
];

function AdminDashboard({ onLogout, onBack }) {
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    if (!selectedClassroom) {
      setReservations([]);
      return;
    }

    const reservationRef = ref(database, `reservedSeats`);
    const unsubscribe = onValue(reservationRef, (snapshot) => {
      const data = snapshot.val();
      const list = [];

      if (data) {
        Object.entries(data).forEach(([time, rooms]) => {
          if (rooms[selectedClassroom.name]) {
            const seats = rooms[selectedClassroom.name];
            const seatEntries = Object.entries(seats);

            if (seatEntries.length === 0) return;

            const firstUserId = seatEntries[0][1];
            const totalSeats = selectedClassroom.rows * selectedClassroom.cols;
            const isFullClassReserved =
              seatEntries.length === totalSeats &&
              seatEntries.every(([_, userId]) => userId === firstUserId);

            if (isFullClassReserved) {
              list.push({
                time,
                seatId: "(교실 전체 예약)",
                userId: firstUserId,
                isFullClass: true,
              });
            } else {
              seatEntries.forEach(([seatId, userId]) => {
                list.push({
                  time,
                  seatId,
                  userId,
                  isFullClass: false,
                });
              });
            }
          }
        });
      }

      setReservations(list);
    });

    return () => unsubscribe();
  }, [selectedClassroom]);

  const handleCancelReservation = (time, seatId, isFullClass = false) => {
    if (!selectedClassroom) return;

    if (isFullClass) {
      const path = `reservedSeats/${time}/${selectedClassroom.name}`;
      remove(ref(database, path))
        .then(() => alert("교실 전체 예약이 취소되었습니다."))
        .catch((err) => alert("취소 중 오류: " + err.message));
    } else {
      const path = `reservedSeats/${time}/${selectedClassroom.name}/${seatId}`;
      remove(ref(database, path))
        .then(() => alert("예약이 취소되었습니다."))
        .catch((err) => alert("취소 중 오류: " + err.message));
    }
  };

  // 디자인 컬러 및 스타일 변수
  const mainBlue = "#3b82f6";
  const darkBlue = "#1e40af";
  const lightBlue = "#eff6ff";

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "40px auto",
        padding: 24,
        backgroundColor: "white",
        borderRadius: 16,
        boxShadow: `0 6px 24px rgba(59,130,246,0.15)`,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#1e293b",
      }}
    >
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {selectedClassroom ? (
          <button
            onClick={() => setSelectedClassroom(null)}
            style={{
              padding: "10px 20px",
              fontSize: 16,
              cursor: "pointer",
              borderRadius: 10,
              border: `2px solid ${mainBlue}`,
              backgroundColor: "white",
              color: mainBlue,
              fontWeight: "600",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = mainBlue;
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.color = mainBlue;
            }}
            aria-label="교실 선택으로 뒤로가기"
          >
            ← 뒤로가기
          </button>
        ) : (
          <button
            onClick={onBack}
            style={{
              padding: "10px 20px",
              fontSize: 16,
              cursor: "pointer",
              borderRadius: 10,
              border: `2px solid ${mainBlue}`,
              backgroundColor: "white",
              color: mainBlue,
              fontWeight: "600",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = mainBlue;
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.color = mainBlue;
            }}
            aria-label="관리자 모드 종료"
          >
            ← 뒤로가기
          </button>
        )}

        <button
          onClick={onLogout}
          style={{
            padding: "10px 20px",
            fontSize: 16,
            cursor: "pointer",
            borderRadius: 10,
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            fontWeight: "600",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b91c1c")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f44336")}
          aria-label="로그아웃"
        >
          로그아웃
        </button>
      </div>

      {!selectedClassroom && (
        <>
          <h2 style={{ color: darkBlue, marginBottom: 24 }}>관리자 대시보드 - 교실 선택</h2>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {classrooms.map((room) => (
              <button
                key={room.name}
                onClick={() => setSelectedClassroom(room)}
                style={{
                  padding: "18px 36px",
                  fontSize: 18,
                  borderRadius: 14,
                  cursor: "pointer",
                  border: `2px solid ${mainBlue}`,
                  backgroundColor: "white",
                  color: mainBlue,
                  fontWeight: "700",
                  flexGrow: 1,
                  minWidth: 180,
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = mainBlue;
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = mainBlue;
                }}
                aria-label={`${room.name} 교실 선택`}
              >
                {room.name}
              </button>
            ))}
          </div>
        </>
      )}

      {selectedClassroom && (
        <>
          <h2 style={{ color: darkBlue, marginTop: 30, marginBottom: 12 }}>
            {selectedClassroom.name} - 예약 현황
          </h2>

          {reservations.length === 0 ? (
            <p style={{ fontSize: 16, color: "#64748b" }}>예약된 좌석이 없습니다.</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 16,
                fontSize: 15,
                color: "#1e293b",
              }}
            >
              <thead>
                <tr style={{ borderBottom: `3px solid ${mainBlue}` }}>
                  <th style={{ textAlign: "left", padding: "10px 12px" }}>시간대</th>
                  <th style={{ textAlign: "left", padding: "10px 12px" }}>좌석</th>
                  <th style={{ textAlign: "left", padding: "10px 12px" }}>예약자 ID</th>
                  <th style={{ textAlign: "center", padding: "10px 12px" }}>취소</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(({ time, seatId, userId, isFullClass }, idx) => (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: isFullClass ? lightBlue : "transparent",
                      fontWeight: isFullClass ? "700" : "400",
                      borderBottom: `1px solid ${lightBlue}`,
                      userSelect: "none",
                    }}
                  >
                    <td style={{ padding: "10px 12px" }}>{time}</td>
                    <td style={{ padding: "10px 12px" }}>{seatId}</td>
                    <td style={{ padding: "10px 12px" }}>{userId}</td>
                    <td style={{ textAlign: "center", padding: "10px 12px" }}>
                      <button
                        onClick={() => handleCancelReservation(time, seatId, isFullClass)}
                        style={{
                          backgroundColor: "#f44336",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          cursor: "pointer",
                          borderRadius: 8,
                          fontWeight: "600",
                          transition: "background-color 0.3s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b91c1c")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f44336")}
                        aria-label={`예약 취소 ${selectedClassroom.name} ${time} ${
                          isFullClass ? "교실 전체" : seatId
                        }`}
                      >
                        취소
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
