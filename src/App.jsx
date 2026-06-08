import {
  Routes,
  Route,
} from "react-router-dom";

import { Navbar }
from "./components/navbar/nav.jsx";

import ProtectedRoute
from "./components/protectedroute/protectedroutes.jsx";

// ================= PAGES =================

import { HomePage }
from "./pages/homepage/homepage";

import MyAssignmentsPage from "./pages/assignment/assignment.jsx";

import { LoginPage }
from "./pages/loginpage/loginpage.jsx";

import { RegisterPage }
from "./pages/registerpage/registerpage";

import { ForgotPasswordPage } from "./pages/forgetpass/forgetpass.jsx";

import { DashboardPage }
from "./pages/dashbooardpage/dashboardpage";

import { QuizPage }
from "./pages/quizpage/quizpage.jsx";

import { MultiplayerPage }
from "./pages/multiplayerpage/multiplayerpage";

import Subjects
from "./pages/subjectpage/subjectpage.jsx";

import Leaderboard
from "./pages/leaderboardpage/leaderboardpage.jsx";

import { PdfUploadPage }
from "./pages/pdfpage/uploadpdfpage.jsx";

import { QuizStoragePage }
from "./pages/quizstoragepage/quizstoragepage.jsx";

import { ProfilePage }
from "./pages/profilepage/profilepage.jsx";

import SubjectDetails
from "./pages/subjectdetaills/subjectdetails.jsx";

import SubjectSetup
from "./pages/subjectsetup/subjectsetup.jsx";

import SubjectAnalytics
from "./pages/subjectanalytics/subjectanalytics.jsx";

import SubjectStudyMode
from "./pages/subjectstudy/subjectstudy.jsx";

import { AiTutorPage }
from "./pages/aitutorpage/aitutorpage.jsx";

import { ImageAiTutorPage }
from "./pages/imageaitutorpage/imagetutor.jsx";

// ================= LMS =================

import { SelectRolePage } from "./pages/selectrole/selectrole.jsx";

import { TeacherDashboard } from "./pages/teacher/teacherdashboard/teacherdashboard.jsx";

import { StudentDashboard } from "./pages/student/studentdashboard.jsx";

import { ClassroomPage } from "./pages/classroom/classroom.jsx";

import { CreateClassroomPage } from "./pages/teacher/createclass/createclass.jsx";

import { CreateAssignmentPage } from "./pages/teacher/createassignment/createassignment.jsx";
import { ClassroomForumPage } from "./pages/classroomforum/classroomforum.jsx";
import { JoinClassroomPage } from "./pages/joinclassroom/joinclassroom.jsx";
import { GlobalChatPage } from "./pages/globachatpage/globachat.jsx";
import { NotificationBell } from "./components/notification/notification.jsx";
import { UpgradePage } from "./pages/upgrade/upgrade.jsx";

import TeacherSubmissionsPage from "./pages/teachersubmmition/teachersubmission.jsx";

import SubmitAssignmentPage from "./pages/submitass/submitass.jsx";

import ClassroomSubmissionsPage from "./pages/classroomsubmit/classroomsubmit.jsx";
import InstallApp from "./components/installapp/installapp.jsx";
import GradeSubmissionsPage from "./pages/gradesubmit/gradesubmit.jsx";
import { ResetPasswordPage } from "./pages/resetpass/resetpass.jsx";
function App() {

  return (

    <>

      <Navbar />
<InstallApp/>
      <Routes>

        {/* ================= PUBLIC ================= */}

        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

          <Route
          path="/notifications"
          element={<NotificationBell />}
        />


 <Route
          path="/upgrade"
          element={<UpgradePage />}
        />

        <Route path='assignment'
        element={<MyAssignmentsPage/>}
        />
<Route
  path="/global-feed"
  element={<GlobalChatPage />}
/>

<Route
  path="/forgot-password"
  element={
    <ForgotPasswordPage />
  }
/>

<Route
  path="/reset-password"
  element={
    <ResetPasswordPage/>
  }
/>
        {/* ================= ROLE ================= */}

        <Route
          path="/select-role"
          element={
            <ProtectedRoute>
              <SelectRolePage />
            </ProtectedRoute>
          }
        />


<Route
  path="/join-classroom"
  element={
    <ProtectedRoute role='student'>
      <JoinClassroomPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/student/assignment/:assignmentId"
  element={
    <ProtectedRoute role="student">
      <SubmitAssignmentPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/teacher/submissions/:assignmentId"
  element={
    <ProtectedRoute role="teacher">
      <ClassroomSubmissionsPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/teacher/grade/:submissionId"
  element={
    <ProtectedRoute role="teacher">
      <GradeSubmissionsPage />
    </ProtectedRoute>
  }
/>


<Route
  path="/teacher-submissions"
  element={
    <ProtectedRoute role="teacher">
      <TeacherSubmissionsPage />
    </ProtectedRoute>
  }
/>
        {/* ================= MAIN DASHBOARD ================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* ================= TEACHER ================= */}

        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute role='teacher'>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-classroom"
          element={
            <ProtectedRoute>
              <CreateClassroomPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-assignment"
          element={
            <ProtectedRoute>
              <CreateAssignmentPage />
            </ProtectedRoute>
          }
        />

        {/* ================= STUDENT ================= */}

        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute role='student'>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= CLASSROOM ================= */}

        <Route
          path="/classroom/:id"
          element={
            <ProtectedRoute>
              <ClassroomPage />
            </ProtectedRoute>
          }
        />


<Route
  path="/classroom/:id/forum"
  element={
    <ProtectedRoute>
      <ClassroomForumPage />
    </ProtectedRoute>
  }
/>
        {/* ================= SUBJECTS ================= */}

        <Route
          path="/subjects"
          element={
            <ProtectedRoute>
              <Subjects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subject/:name"
          element={
            <ProtectedRoute>
              <SubjectDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subject/:name/setup"
          element={
            <ProtectedRoute>
              <SubjectSetup />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subject/:name/analytics"
          element={
            <ProtectedRoute>
              <SubjectAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/subject/:id/study"
          element={
            <ProtectedRoute>
              <SubjectStudyMode />
            </ProtectedRoute>
          }
        />

        {/* ================= QUIZ ================= */}

        <Route
          path="/quiz/:subject"
          element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          }
        />

        {/* ================= AI ================= */}

        <Route
          path="/ai-tutor"
          element={
            <ProtectedRoute>
              <AiTutorPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/imagetutor"
          element={
            <ProtectedRoute>
              <ImageAiTutorPage />
            </ProtectedRoute>
          }
        />

        {/* ================= STORAGE ================= */}

        <Route
          path="/quizstorage"
          element={
            <ProtectedRoute>
              <QuizStoragePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <PdfUploadPage />
            </ProtectedRoute>
          }
        />

        {/* ================= PROFILE ================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* ================= MULTIPLAYER ================= */}

        <Route
          path="/multiplayer"
          element={
            <ProtectedRoute>
              <MultiplayerPage />
            </ProtectedRoute>
          }
        />



        {/* ================= LEADERBOARD ================= */}

        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />

      </Routes>

    </>
  );
}

export default App;