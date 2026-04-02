import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { RequireAuth } from './components/RequireAuth';
import Layout from './components/Layout';
import Home from './pages/Home';
import Stories from './pages/Stories';
import StoryDetail from './pages/StoryDetail';
import Signup from './pages/Signup';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminWrite from './pages/admin/AdminWrite';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public site */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="stories" element={<Stories />} />
            <Route path="story/:id" element={<StoryDetail />} />
            <Route path="signup" element={<Signup />} />
            {/* Redirect legacy /create to /admin/write (which needs auth) */}
            <Route path="create" element={<Navigate to="/admin/write" replace />} />
          </Route>

          {/* User/Admin Dashboard */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/write"
            element={
              <RequireAuth>
                <AdminWrite />
              </RequireAuth>
            }
          />
          <Route
            path="/admin/write/:id"
            element={
              <RequireAuth>
                <AdminWrite />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
