import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import OrganizerDashboard from './pages/Organizer/OrganizerDashboard.jsx';
import AttendeeDashboard from './pages/Attendee/AttendeeDashboard.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx'; // Make sure this path matches where you saved the file
import { ThemeProvider } from './ThemeContext'; // Import ThemeProvider
import axios from 'axios';

// Global Axios Interceptor for Auto-Logout on Suspension/Expiration
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Clear all local storage authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // If we are already on the landing page/login, do not infinitely redirect
      if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
        alert(error.response.data?.Message || "Your session has expired or your account was suspended. Please log in again.");
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

function App() {
  return (
    <ThemeProvider> {/* Wrap your app with ThemeProvider for dark mode to work */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LandingPage />} />
          <Route path="/create-account" element={<LandingPage />} />
          <Route path="/dashboard" element={<OrganizerDashboard />} />
          <Route path="/attendee" element={<AttendeeDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;