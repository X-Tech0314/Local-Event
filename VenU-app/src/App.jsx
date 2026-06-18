import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import OrganizerDashboard from './pages/Organizer/OrganizerDashboard.jsx';
import AttendeeDashboard from './pages/Attendee/AttendeeDashboard.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx'; // Make sure this path matches where you saved the file
import { ThemeProvider } from './ThemeContext'; // Import ThemeProvider

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