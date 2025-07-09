import React from "react";

const classrooms = [
  { name: "수학전용실", rows: 3, cols: 4 },
  { name: "수학미디어스페이스실", rows: 2, cols: 5 },
  { name: "홈베이스", rows: 6, cols: 3 },
];

function ClassroomSelect({ onSelect, userId, onLogout }) {
  const mainColor = "#0077cc";       // 메인 블루 톤
  const mainColorDark = "#005fa3";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #cceeff, #e0f7fa)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          backgroundColor: "white",
          borderRadius: 12,
          boxShadow: `0 6px 20px rgba(112, 161, 255, 0.3)`,
          padding: "30px 40px",
          boxSizing: "border-box",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#222",
              userSelect: "none",
            }}
          >
            로그인 ID: <span style={{ color: mainColor }}>{userId}</span>
          </div>
          <button
            onClick={onLogout}
            style={{
              padding: "8px 18px",
              backgroundColor: mainColor,
              border: "none",
              borderRadius: 6,
              color: "white",
              fontWeight: "600",
              fontSize: 14,
              cursor: "pointer",
              transition: "background-color 0.3s",
              userSelect: "none",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = mainColorDark)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = mainColor)
            }
            aria-label="로그아웃"
          >
            로그아웃
          </button>
        </header>

        <h1
          style={{
            textAlign: "center",
            color: mainColorDark,
            fontWeight: "700",
            fontSize: 28,
            marginBottom: 24,
            userSelect: "none",
          }}
        >
          교실 선택
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 20,
          }}
        >
          {classrooms.map((room) => (
            <button
              key={room.name}
              onClick={() => onSelect(room)}
              style={{
                width: "100%",
                padding: "16px 0",
                backgroundColor: mainColor,
                border: "none",
                borderRadius: 10,
                color: "white",
                fontSize: 20,
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: `0 4px 8px rgba(112, 161, 255, 0.4), inset 0 -3px 6px rgba(74, 121, 224, 0.7)`,
                transition: "background-color 0.25s ease",
                userSelect: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = mainColorDark)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = mainColor)
              }
              aria-label={`${room.name} 선택`}
            >
              {room.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ClassroomSelect;
