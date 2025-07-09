import React, { useState, useEffect } from "react";
import ClassroomSelect from "./components/ClassroomSelect";
import SeatReservation from "./components/SeatReservation";
import MyReservationList from "./components/MyReservationList";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const [studentId, setStudentId] = useState(null);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [showMyReservations, setShowMyReservations] = useState(false);
  const [isClassroomBookingMode, setIsClassroomBookingMode] = useState(false);
  const [adminMode, setAdminMode] = useState(false); // 관리자 모드 상태 추가

  useEffect(() => {
    const savedId = localStorage.getItem("studentId");
    if (savedId) {
      setStudentId(savedId);
      if (savedId === "admin") {
        setAdminMode(true);
      }
    }
  }, []);

  const userType = studentId && studentId.startsWith("T-") ? "teacher" : "student";

  const handleLogout = () => {
    localStorage.removeItem("studentId");
    localStorage.removeItem("userType");
    setStudentId(null);
    setSelectedClassroom(null);
    setShowMyReservations(false);
    setIsClassroomBookingMode(false);
    setAdminMode(false);
  };

  const handleClassroomBooking = (classroom) => {
    setSelectedClassroom(classroom);
    setIsClassroomBookingMode(true);
  };

  if (!studentId) {
    return (
      <Login
        onLogin={(id) => {
          setStudentId(id);
          if (id === "admin") setAdminMode(true);
        }}
      />
    );
  }

  if (adminMode) {
    return (
      <AdminDashboard
        onBack={() => setAdminMode(false)} // 관리자 모드 종료
        onLogout={handleLogout} // 로그아웃 처리
      />
    );
  }

  if (showMyReservations) {
    return (
      <MyReservationList
        studentId={studentId}
        onBack={() => setShowMyReservations(false)}
      />
    );
  }

  if (selectedClassroom) {
    return (
      <SeatReservation
        classroom={selectedClassroom}
        onBack={() => {
          setSelectedClassroom(null);
          setIsClassroomBookingMode(false);
        }}
        classroomBookingMode={isClassroomBookingMode}
        studentId={studentId}
      />
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <ClassroomSelect
        onSelect={setSelectedClassroom}
        userId={studentId}
        onLogout={handleLogout}
        userType={userType}
        onClassroomBooking={handleClassroomBooking}
      />
      <button
        onClick={() => setShowMyReservations(true)}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "8px",
        }}
      >
        예약 목록 보기
      </button>
    </div>
  );
}

export default App;
