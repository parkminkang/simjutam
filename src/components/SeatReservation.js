import React, { useState, useEffect } from "react";
import { ref, onValue, set, update, remove } from "firebase/database";
import { database } from "../firebase";

const timeSlots = [
  { label: "08:30~09:20 (1교시)", start: "09:20" },
  { label: "9:30~10:20 (2교시)", start: "10:20" },
  { label: "10:30~11:20 (3교시)", start: "11:20" },
  { label: "11:30~12:20 (4교시)", start: "12:20" },
  { label: "13:10~14:00 (5교시)", start: "14:00" },
  { label: "14:10~15:00 (6교시)", start: "15:00" },
  { label: "15:10~16:00 (7교시)", start: "16:00" },
  { label: "16:20~17:10 (8교시)", start: "17:10" },
  { label: "17:20~18:10 (9교시)", start: "18:10" },
  { label: "19:10~20:20 (야자 1교시)", start: "20:20" },
  { label: "20:30~22:00 (야자 2교시)", start: "22:00" },
];

function SeatReservation({ classroom, onBack, studentId }) {
  const [selectedTime, setSelectedTime] = useState(timeSlots[0].label);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [mySeat, setMySeat] = useState(null);
  const [showReservations, setShowReservations] = useState(false);
  const [myReservations, setMyReservations] = useState([]);

  const isTeacher = studentId && studentId.startsWith("T-");

  useEffect(() => {
    const reservationRef = ref(database, `reservedSeats/${selectedTime}/${classroom.name}`);
    onValue(reservationRef, (snapshot) => {
      const data = snapshot.val();
      const newReserved = data ? Object.entries(data) : [];
      setReservedSeats(newReserved);
    });
  }, [selectedTime, classroom.name]);

  useEffect(() => {
    if (!showReservations || !studentId) return;

    const allReservationsRef = ref(database, "reservedSeats");
    onValue(allReservationsRef, (snapshot) => {
      const data = snapshot.val();
      const myList = [];
      if (data) {
        Object.entries(data).forEach(([time, rooms]) => {
          Object.entries(rooms).forEach(([roomName, seats]) => {
            const seatEntries = Object.entries(seats);
            const allMatch = seatEntries.every(([, id]) => id === studentId);

            if (allMatch && seatEntries.length === classroom.rows * classroom.cols) {
              myList.push({ time, seatId: `${roomName} (교실 전체)` });
            } else {
              seatEntries.forEach(([seatId, id]) => {
                if (id === studentId) {
                  myList.push({ time, seatId });
                }
              });
            }
          });
        });
      }
      setMyReservations(myList);
    });
  }, [showReservations, studentId, classroom.rows, classroom.cols]);

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
    setMySeat(null);
  };

  const handleSeatClick = (seatId) => {
    const alreadyReserved = reservedSeats.some(([id]) => id === seatId);
    if (alreadyReserved) {
      alert("이미 예약된 자리입니다!");
      return;
    }
    setMySeat(seatId);
  };

  const handleReserve = () => {
    if (!studentId) {
      alert("학번 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    const now = new Date();
    const slotStartStr = selectedTime.split("~")[0];
    const [hour, minute] = slotStartStr.split(":").map(Number);
    const slotStart = new Date();
    slotStart.setHours(hour, minute, 0);

    if (now > slotStart) {
      alert("이미 지난 시간은 예약할 수 없습니다.");
      return;
    }

    const isDuplicate = reservedSeats.some(([_, id]) => id === studentId);
    if (isDuplicate && !isTeacher) {
      alert("이미 이 시간대에 예약한 좌석이 있습니다.");
      return;
    }

    if (!mySeat) {
      alert("좌석을 선택하세요!");
      return;
    }

    const seatRef = ref(database, `reservedSeats/${selectedTime}/${classroom.name}/${mySeat}`);
    set(seatRef, studentId)
      .then(() => {
        alert("예약 완료!");
        setMySeat(null);
      })
      .catch((err) => {
        alert("예약 중 오류: " + err.message);
      });
  };

  const handleClassroomReserve = async () => {
    if (!studentId || !isTeacher) {
      alert("교직원만 이용할 수 있습니다.");
      return;
    }

    const now = new Date();
    const slotStartStr = selectedTime.split("~")[0];
    const [hour, minute] = slotStartStr.split(":").map(Number);
    const slotStart = new Date();
    slotStart.setHours(hour, minute, 0);

    if (now > slotStart) {
      alert("이미 지난 시간은 예약할 수 없습니다.");
      return;
    }

    try {
      const reservationRef = ref(database, `reservedSeats/${selectedTime}/${classroom.name}`);
      const snapshot = await new Promise((resolve) =>
        onValue(reservationRef, resolve, { onlyOnce: true })
      );
      const data = snapshot.val();

      if (data) {
        const seatIds = Object.keys(data);
        const firstUserId = data[seatIds[0]];
        const allSameUser =
          seatIds.length === classroom.rows * classroom.cols &&
          seatIds.every((seatId) => data[seatId] === firstUserId);

        if (!allSameUser) {
          alert("이미 일부 좌석이 예약되어 있어 교실 전체 예약이 불가능합니다.");
          return;
        }

        if (allSameUser && firstUserId === studentId) {
          alert("이미 이 교실 전체를 예약하셨습니다.");
          return;
        }
      }

      const seatsToReserve = {};
      for (let r = 0; r < classroom.rows; r++) {
        for (let c = 1; c <= classroom.cols; c++) {
          const seatId = String.fromCharCode(65 + r) + c;
          seatsToReserve[`reservedSeats/${selectedTime}/${classroom.name}/${seatId}`] = studentId;
        }
      }

      await update(ref(database), seatsToReserve);
      alert(`${classroom.name} 교실 전체가 ${studentId}님 명의로 예약되었습니다.`);
    } catch (error) {
      alert("전체 교실 예약 실패: " + error.message);
    }
  };

  const handleCancelReservation = (time, seatId) => {
    const path = seatId.includes("(교실 전체)")
      ? `reservedSeats/${time}/${classroom.name}`
      : `reservedSeats/${time}/${classroom.name}/${seatId}`;

    remove(ref(database, path))
      .then(() => {
        alert("예약 취소 완료!");
      })
      .catch((err) => {
        alert("예약 취소 중 오류: " + err.message);
      });
  };

  // ====== 디자인 시작 ======

  const mainBlue = "#3b82f6";
  const darkBlue = "#1e40af";
  const lightBlue = "#eff6ff";
  const seatReservedColor = "#9ca3af"; // 회색
  const seatAvailableColor = "#bbf7d0"; // 연초록
  const seatSelectedColor = "#fbbf24"; // 노란색

  return (
    <div
      style={{
        maxWidth: 680,
        margin: "40px auto",
        padding: 24,
        backgroundColor: "white",
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(59,130,246,0.2)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#1e293b",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: 0, color: darkBlue }}>{classroom.name} 좌석 예약</h2>
        <button
          onClick={onBack}
          style={{
            backgroundColor: mainBlue,
            border: "none",
            borderRadius: 10,
            color: "white",
            padding: "10px 18px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.25s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = darkBlue)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = mainBlue)}
          aria-label="뒤로가기"
        >
          ← 교실 선택
        </button>
      </header>

      <section style={{ marginBottom: 20 }}>
        <button
          onClick={() => setShowReservations(!showReservations)}
          style={{
            backgroundColor: showReservations ? darkBlue : mainBlue,
            border: "none",
            borderRadius: 10,
            color: "white",
            padding: "10px 20px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.25s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = showReservations ? mainBlue : darkBlue)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = showReservations ? darkBlue : mainBlue)
          }
          aria-label="예약 목록 토글"
        >
          {showReservations ? "예약 목록 닫기" : "내 예약 목록 보기"}
        </button>

        {showReservations && (
          <div
            style={{
              marginTop: 12,
              backgroundColor: lightBlue,
              borderRadius: 12,
              padding: 12,
              maxHeight: 180,
              overflowY: "auto",
              color: "#334155",
              fontSize: 14,
              userSelect: "none",
            }}
            aria-live="polite"
          >
            {myReservations.length === 0 ? (
              <p style={{ margin: 0 }}>예약한 좌석이 없습니다.</p>
            ) : (
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {myReservations.map((res, idx) => (
                  <li
                    key={idx}
                    style={{
                      marginBottom: 8,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      <strong>{res.time}</strong> - {res.seatId}
                    </span>
                    <button
                      onClick={() => handleCancelReservation(res.time, res.seatId)}
                      style={{
                        padding: "4px 10px",
                        fontSize: 12,
                        borderRadius: 6,
                        border: "none",
                        backgroundColor: "#ef4444",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: "600",
                        userSelect: "none",
                      }}
                      aria-label={`예약 취소 ${res.time} ${res.seatId}`}
                    >
                      취소
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section style={{ marginBottom: 20 }}>
        <label
          htmlFor="time-select"
          style={{
            fontWeight: "700",
            color: darkBlue,
            marginBottom: 8,
            display: "block",
            userSelect: "none",
          }}
        >
          시간대 선택
        </label>
        <select
          id="time-select"
          value={selectedTime}
          onChange={handleTimeChange}
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: 16,
            borderRadius: 12,
            border: `2px solid ${mainBlue}`,
            outline: "none",
            cursor: "pointer",
            userSelect: "none",
            color: "#1e293b",
            backgroundColor: "#f8fafc",
            transition: "border-color 0.3s",
          }}
          aria-label="시간대 선택"
        >
          {timeSlots.map((slot) => {
            const now = new Date();
            const [h, m] = slot.start.split(":").map(Number);
            const slotTime = new Date();
            slotTime.setHours(h, m, 0);
            const isPast = now > slotTime;

            return (
              <option key={slot.label} value={slot.label} disabled={isPast}>
                {slot.label} {isPast ? "🕐 (지남)" : ""}
              </option>
            );
          })}
        </select>
      </section>

      <section style={{ marginBottom: 20 }}>
        <label
          style={{
            fontWeight: "700",
            color: darkBlue,
            marginBottom: 10,
            display: "block",
            userSelect: "none",
          }}
        >
          좌석 선택
        </label>
        {[...Array(classroom.rows)].map((_, rowIdx) => (
          <div
            key={rowIdx}
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 14,
              justifyContent: "center",
            }}
          >
            {[...Array(classroom.cols)].map((_, colIdx) => {
              const seatId = String.fromCharCode(65 + rowIdx) + (colIdx + 1);
              const reservedItem = reservedSeats.find(([id]) => id === seatId);
              const reserved = !!reservedItem;
              const reservedById = reservedItem ? reservedItem[1] : null;
              const isMine = mySeat === seatId;

              return (
                <button
                  key={seatId}
                  onClick={() => handleSeatClick(seatId)}
                  disabled={reserved}
                  title={reserved ? `예약됨: ${reservedById}` : `좌석 ${seatId}`}
                  style={{
                    width: 70,
                    height: 70,
                    fontSize: 16,
                    borderRadius: 14,
                    border: "none",
                    fontWeight: "700",
                    color: reserved ? "white" : "#1e293b",
                    backgroundColor: isMine
                      ? seatSelectedColor
                      : reserved
                      ? seatReservedColor
                      : seatAvailableColor,
                    cursor: reserved ? "not-allowed" : "pointer",
                    boxShadow: isMine
                      ? `0 0 8px 2px ${mainBlue}`
                      : "0 1px 4px rgba(0,0,0,0.15)",
                    userSelect: "none",
                    transition: "background-color 0.25s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-pressed={isMine}
                >
                  {reserved ? reservedById : seatId}
                </button>
              );
            })}
          </div>
        ))}
      </section>

      <section
        style={{
          display: "flex",
          justifyContent: isTeacher ? "space-between" : "center",
          gap: 12,
          marginTop: 10,
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={handleReserve}
          style={{
            flex: "1 1 120px",
            height: 48,
            backgroundColor: mainBlue,
            borderRadius: 14,
            border: "none",
            color: "white",
            fontWeight: "700",
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
            userSelect: "none",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = darkBlue)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = mainBlue)}
          aria-label="좌석 예약하기"
        >
          예약하기
        </button>

        {isTeacher && (
          <button
            onClick={handleClassroomReserve}
            style={{
              flex: "1 1 120px",
              height: 48,
              backgroundColor: "#16a34a", // 초록
              borderRadius: 14,
              border: "none",
              color: "white",
              fontWeight: "700",
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(22,163,74,0.4)",
              userSelect: "none",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#166534")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#16a34a")}
            aria-label="교실 전체 예약하기"
          >
            교실 예약
          </button>
        )}
      </section>
    </div>
  );
}

export default SeatReservation;
