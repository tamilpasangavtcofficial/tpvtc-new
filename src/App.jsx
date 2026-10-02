import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import EventBooking from './pages/EventBooking';
import Calendar from './pages/Calendar';
import Supporters from './pages/Supporters';
import Partners from './pages/Partners';
import Albums from './pages/Albums';
import AlbumView from './pages/AlbumView';
import Contact from './pages/Contact';
import Login from './pages/Login';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';

// Hub Imports
import HubLayout from './hub/HubLayout';
import HubDashboard from './hub/HubDashboard';
import HubSlots from './hub/HubSlots';
import HubRequests from './hub/HubRequests';
import HubSlotLogs from './hub/HubSlotLogs';
import HubAlbums from './hub/HubAlbums';
import HubSupporters from './hub/HubSupporters';
import HubPartners from './hub/HubPartners';
import HubRecognition from './hub/HubRecognition';
import HubUsers from './hub/HubUsers';
import HubStats from './hub/HubStats';

const PublicLayout = () => (
  <div className="app-container">
    <Navbar />
    <main className="main-content">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventId" element={<EventBooking />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/supporters" element={<Supporters />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/albums" element={<Albums />} />
          <Route path="/albums/:id" element={<AlbumView />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
        </Route>

        {/* Driver Hub Pages */}
        <Route path="/hub" element={<HubLayout />}>
          <Route index element={<HubDashboard />} />
          <Route path="slots" element={<HubSlots />} />
          <Route path="requests" element={<HubRequests />} />
          <Route path="slot-logs" element={<HubSlotLogs />} />
          <Route path="albums" element={<HubAlbums />} />
          <Route path="supporters" element={<HubSupporters />} />
          <Route path="partners" element={<HubPartners />} />
          <Route path="recognition" element={<HubRecognition />} />
          <Route path="users" element={<HubUsers />} />
          <Route path="stats" element={<HubStats />} />
          {/* We will add other pages later */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
