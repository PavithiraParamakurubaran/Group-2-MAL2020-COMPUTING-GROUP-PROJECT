import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoleSelect from "./pages/main/RoleSelect";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import AdminLogin from "./pages/auth/AdminLogin";
import EmployerLogin from "./pages/auth/EmployerLogin";
import StudentLogin from "./pages/auth/StudentLogin";
import ForgotPassword from "./pages/auth/ForgotPassword";
import StudentProfile from "./pages/student/StudentProfile";
import StudentManagement from "./pages/admin/StudentManagement";
import EmployerManagement from "./pages/admin/EmployerManagement";
import AddReminder from "./pages/admin/AddReminder";
import AdminProfile from "./pages/admin/AdminProfile";
import AddAdmin from "./pages/admin/AddAdmin";
import EmployerProfile from "./pages/employer/EmployerProfile";
import PostJob from "./pages/employer/PostJob";
import JobListing from "./pages/employer/JobListing";
import GenerateResumeStep1 from "./pages/student/GenerateResumeStep1";
import GenerateResumeStep2Instructions from "./pages/student/GenerateResumeStep2Instructions";
import GenerateResumeStep2Questions from "./pages/student/GenerateResumeStep2Questions";
import GenerateResumeStep2Result from "./pages/student/GenerateResumeStep2Results";
import GenerateResumeStep3Instructions from "./pages/student/GenerateResumeStep3Instructions";
import GenerateResumeStep3Questions from "./pages/student/GenerateResumeStep3Questions";
import GenerateResumeStep3Result from "./pages/student/GenerateResumeStep3Results";
import GenerateResumeStep4Instructions from "./pages/student/GenerateResumeStep4Instructions";
import GenerateResumeStep4Questions from "./pages/student/GenerateResumeStep4Questions";
import GenerateResumeStep4Results from "./pages/student/GenerateResumeStep4Results";
import GenerateResumeStep5Instructions from "./pages/student/GenerateResumeStep5Instructions";
import GenerateResumeStep5 from "./pages/student/GenerateResumeStep5";
import GenerateResumeCompleted from "./pages/student/GenerateResumeCompleted";
import StudentViewJobs from "./pages/student/StudentViewJobs";
import AppliedJobs from "./pages/student/AppliedJobs";
import EmployerViewApplication from "./pages/employer/EmployerViewApplication";
import EmployerReport from "./pages/employer/EmployerReport";
import EmployerInterviewSchedule from "./pages/employer/EmployerInterviewSchedule";
import StudentDocuments from "./pages/student/StudentDocuments";
import StudentInterviewSchedule from "./pages/student/StudentInterviewSchedule";
import DailyReportPage from "./pages/student/DailyReportPage";
import WeeklyReportPage from "./pages/student/WeeklyReportPage";
import AttendancePage from "./pages/student/AttendancePage";
import AdminAnalyticalReport from "./pages/admin/AdminAnalyticalReport";
import AdminStudentDocuments from "./pages/admin/AdminStudentDocuments";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Role selection */}
        <Route path="/" element={<RoleSelect />} />

        {/* Login */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/employer/login" element={<EmployerLogin />} />
        <Route path="/student/login" element={<StudentLogin />} />

        {/* Dashboards */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />

        {/* Student Dashboard */}
        <Route path="/profile" element={<StudentProfile />} />

        {/* Step 1 routes */}
        <Route path="/generate-resume" element={<GenerateResumeStep1 />} />
        <Route path="/student/generate-resume/:resumeId" element={<GenerateResumeStep1 />} />

        <Route path="/student/resume/step2instructions/:resumeId" element={<GenerateResumeStep2Instructions />} />
        <Route path="/student/resume/step2/questions/:resumeId" element={<GenerateResumeStep2Questions />} />
        <Route path="/student/generate-resume-step2-results/:resumeId" element={<GenerateResumeStep2Result />} />

        <Route path="/student/generate-resume-step3-instructions/:resumeId" element={<GenerateResumeStep3Instructions />} />
        <Route path="/student/resume/step3/questions/:resumeId" element={<GenerateResumeStep3Questions />} />
        <Route path="/student/resume/step3/result/:resumeId" element={<GenerateResumeStep3Result />} />

        <Route path="/student/resume/step4/instructions/:resumeId" element={<GenerateResumeStep4Instructions />} />
        <Route path="/student/resume/step4/questions/:resumeId" element={<GenerateResumeStep4Questions />} />
        <Route path="/student/resume/step4/result/:resumeId" element={<GenerateResumeStep4Results />} />

        <Route path="/student/resume/step5/instructions/:resumeId" element={<GenerateResumeStep5Instructions />} />
        <Route path="/student/resume/step5/generate/:resumeId" element={<GenerateResumeStep5 />} />
        <Route path="/student/resume/:resumeId/completed/:generatedId" element={<GenerateResumeCompleted />} />

        <Route path="/jobs" element={<StudentViewJobs />} />
        <Route path="/applied-jobs" element={<AppliedJobs />} />
        <Route path="/documents" element={<StudentDocuments />} />
        <Route path="/interview-schedule" element={<StudentInterviewSchedule />} />
        <Route path="/daily-report" element={<DailyReportPage />} />
        <Route path="/weekly-report" element={<WeeklyReportPage />} />
        <Route path="/attendance" element={<AttendancePage />} />

        {/* Admin Dashboard */}
        <Route path="/admin/students" element={<StudentManagement />} />
        <Route path="/admin/employers" element={<EmployerManagement />} />
        <Route path="/admin/reminders" element={<AddReminder />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/reports" element={<AdminAnalyticalReport />} />
        <Route path="/admin/newadmin" element={<AddAdmin />} />
        <Route path="/admin/student-documents" element={<AdminStudentDocuments />} />

        {/* Employer Dashboard */}
        <Route path="/employer/profile" element={<EmployerProfile />} />
        <Route path="/employer/post-job" element={<PostJob />} />
        <Route path="/employer/job-list" element={<JobListing />} />
        <Route path="/employer/applications" element={<EmployerViewApplication />} />
        <Route path="/employer/employment-report" element={<EmployerReport />} />
        <Route path="/employer/interview-schedule" element={<EmployerInterviewSchedule />} />

        {/* Forgot password */}
        <Route path="/forgot-password/:role" element={<ForgotPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;