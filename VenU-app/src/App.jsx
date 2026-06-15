import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import OrganizerDashboard from './pages/Organizer/OrganizerDashboard.jsx';
import AttendeeDashboard from './pages/Attendee/AttendeeDashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LandingPage />} />
        <Route path="/create-account" element={<LandingPage />} />
        <Route path="/dashboard" element={<OrganizerDashboard />} />
        <Route path="/attendee" element={<AttendeeDashboard />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
