import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Map, Ticket, QrCode, Bookmark, Settings, User, MapPin } from 'lucide-react';
import slide1 from '../assets/image_44e35a.png';
import slide2 from '../assets/image_44e2c5.png';
import slide3 from '../assets/image_44e262.png';
import slide4 from '../assets/image_3b04de.png';
import teamBg from '../assets/image_3a8519.png';
import featuresMockup from '../assets/features-mockup-2.png';
import logo from '../assets/venu-logo3-transparent.png';
import AuthModal from '../components/Auth/AuthModal.jsx';

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="p-6 bg-slate-900/50 hover:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-800 hover:border-purple-500/50 shadow-xl hover:-translate-y-2 transition-all duration-300 group">
    <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-300 border border-purple-500/10">
      <Icon className="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
    </div>
    <h4 className="text-lg font-semibold text-white tracking-wide">{title}</h4>
    <p className="mt-2 text-sm text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

const features = [
  { icon: Map, title: 'Event Maps', desc: 'Map venue locations so attendees find your space easily.' },
  { icon: Ticket, title: 'Ticket Availing', desc: 'Sell and manage tickets with simple purchase flows.' },
  { icon: QrCode, title: 'QR / Invite Codes', desc: 'Use QR or code-based entry to keep events private.' },
  { icon: Bookmark, title: 'Saved Events', desc: 'Save events you\'re interested in to revisit later.' },
  { icon: Settings, title: 'User Settings', desc: 'Manage preferences, notifications, and account settings.' },
];

const slides = [
  {
    image: slide1,
    headline: (
      <>
        THE STAGE IS SET.
        <br />
        STEP INSIDE.
      </>
    ),
  },
  {
    image: slide2,
    headline: (
      <>
        EXPERIENCE THE VIBRANCE.
        <br />
        LIVE.
      </>
    ),
  },
  {
    image: slide3,
    headline: (
      <>
        DISCOVER LOCAL ACTION.
        <br />
        EXPLORE.
      </>
    ),
  },
  {
    image: slide4,
    headline: (
      <>
        CELEBRATE COMMUNITY
        <br />
        MILESTONES.
      </>
    ),
  },
];

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [activeSlide, setActiveSlide] = useState(0);
  const [createRole, setCreateRole] = useState('Attendee');
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const mainContainerRef = useRef(null);
  const navigate = useNavigate();

  const scrollToTop = () => {
    mainContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  function handleCloseAuth() {
    setShowAuth(false);
  }

  function getSubtitle() {
    if (!showAuth) {
      return 'Bridge the gap between intimate milestones and grand public gatherings. Secure passes, explore hyper-local maps, and unlock private events instantly within your community.';
    }
    if (authView === 'login') {
      return 'Sign in to discover events, grab your tickets, and manage your community milestones.';
    }
    return createRole === 'Organizer'
      ? 'Set up your organizer account and start creating unforgettable experiences.'
      : 'Join the community, explore events around you, and save your favorites.';
  }

  return (
    <div ref={mainContainerRef} className="min-h-screen bg-slate-950 text-white overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>

      {/* -- Success Animation Overlay -- */}
      {showSuccessAnim && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-slate-900 border border-purple-500/30 p-10 rounded-3xl shadow-2xl shadow-purple-500/20 flex flex-col items-center transform transition-transform duration-500 scale-100">
            <div className="relative">
              <img src="https://media.giphy.com/media/26tOZ42Mg6pbTUPHW/giphy.gif" alt="Confetti" className="w-48 h-48 object-cover rounded-full mix-blend-screen opacity-80 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="text-8xl mb-6 animate-bounce relative z-10">🎉</div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Successfully created!</h3>
            <p className="text-slate-400 text-sm font-medium">Welcome to the VenU community.</p>
          </div>
        </div>
      )}

      {/* -- Navbar -- */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/75 backdrop-blur-md border-b border-white/5 hover:bg-slate-950/95 hover:border-purple-500/25 transition-all duration-300 group/nav shadow-lg hover:shadow-purple-500/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 cursor-pointer select-none hover:scale-105 transition-all duration-300">
            <img src={logo} alt="VenU Logo" className="h-8 w-auto drop-shadow-md" />
            <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">VenU</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#features" className="text-white/80 hover:text-purple-300 hover:bg-purple-500/10 px-3 py-1.5 rounded-lg transition-all duration-300 text-sm font-medium">Features</a>
            <a href="#about" className="text-white/80 hover:text-purple-300 hover:bg-purple-500/10 px-3 py-1.5 rounded-lg transition-all duration-300 text-sm font-medium">About Us</a>
            <button
              onClick={() => {
                setShowAuth(true);
                scrollToTop();
              }}
              className="ml-2 px-5 py-2 border border-purple-500/30 hover:bg-purple-600 hover:border-purple-500 hover:scale-105 active:scale-95 rounded-full text-sm font-semibold text-white shadow-lg shadow-purple-500/10 transition-all duration-300 cursor-pointer"
            >
              Login / Sign Up
            </button>
          </nav>
        </div>
      </header>

      {/* -- Hero Section -- */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Full-screen background images (Carousel) */}
        {slides.map((slide, idx) => (
          <img
            key={idx}
            src={slide.image}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              idx === activeSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ objectPosition: 'center 30%' }}
          />
        ))}
        {/* Dark transparent masking overlay */}
        <div
          onClick={() => { if (showAuth) handleCloseAuth(); }}
          className={`absolute inset-0 bg-black/40 ${showAuth ? 'cursor-pointer' : ''}`}
        />
        {/* Bottom gradient overlay to blend into slate-950 */}
        <div
          onClick={() => { if (showAuth) handleCloseAuth(); }}
          className={`absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/90 ${showAuth ? 'cursor-pointer' : ''}`}
        />

        {/* Content row */}
        <div className="relative z-10 min-h-screen flex items-center pt-20 pb-12">

          {/* Hero Text - sweeps left when auth opens */}
          <div
            onClick={() => { if (showAuth) handleCloseAuth(); }}
            className={`flex items-center transition-all duration-700 ease-in-out shrink-0 ${showAuth ? 'cursor-pointer hero-text-auth-open' : ''}`}
            style={{ width: showAuth ? (authView === 'login' ? '55%' : '35%') : '100%' }}
          >
            <div
              className={`w-full px-8 md:px-16 lg:px-20 transition-all duration-700 ease-in-out ${showAuth ? 'text-left' : 'text-center'
                }`}
              onClick={(e) => {
                if (showAuth) {
                  // Allow clicks inside hero div but close auth when clicking general background
                  e.stopPropagation();
                  handleCloseAuth();
                }
              }}
            >
              <h1
                className="font-extrabold italic text-white leading-[1.05] tracking-tight transition-all duration-700"
                style={{ fontSize: showAuth ? 'clamp(2.4rem, 4.5vw, 4rem)' : 'clamp(2.8rem, 5.5vw, 5rem)' }}
              >
                {slides[activeSlide].headline}
              </h1>
              <p className={`mt-6 text-base md:text-lg text-white/60 leading-relaxed transition-all duration-700 ${showAuth ? 'max-w-lg' : 'max-w-2xl mx-auto'
                }`}>
                {getSubtitle()}
              </p>

              {/* LEARN MORE - hides when auth is open */}
              <div
                className="mt-8 transition-all duration-500"
                style={{
                  opacity: showAuth ? 0 : 1,
                  maxHeight: showAuth ? 0 : '80px',
                  overflow: 'hidden',
                  pointerEvents: showAuth ? 'none' : 'auto',
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-3 bg-purple-500 hover:bg-purple-600 rounded-full text-white font-semibold shadow-lg shadow-purple-500/25 transition-all"
                >
                  LEARN MORE
                </button>
              </div>
            </div>
          </div>

          {/* Carousel Indicators (Dots) */}
          {!showAuth && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === activeSlide ? 'w-8 bg-purple-500' : 'w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* -- Auth Panel -- */}
          <AuthModal
            key={showAuth ? 'open' : 'closed'}
            showAuth={showAuth}
            onClose={handleCloseAuth}
            authView={authView}
            setAuthView={setAuthView}
            createRole={createRole}
            setCreateRole={setCreateRole}
            onLoginSubmit={async (data) => {
              try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                  email: data.email,
                  password: data.password
                });
                const user = response.data.user;
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(user));
                if (user.role === 'Organizer') {
                  navigate('/dashboard');
                } else {
                  navigate('/attendee');
                }
              } catch (err) {
                if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
                  const role = data.email.includes('organizer') ? 'Organizer' : 'Attendee';
                  localStorage.setItem('token', 'mock-jwt-token');
                  localStorage.setItem('user', JSON.stringify({ id: 'mock-123', email: data.email, role, firstName: 'Mock', lastName: 'User' }));
                  return navigate(role === 'Organizer' ? '/dashboard' : '/attendee');
                }
                alert('Login failed: ' + (err.response?.data?.message || err.message));
              }
            }}
            onRegisterSubmit={async (data) => {
              try {
                const role = data.role || createRole || 'Attendee';
                const p = role === 'Organizer' ? data.personal : data;
                const payload = { email: p?.email || '', password: p?.password || '', role, firstName: p?.firstName || '', lastName: p?.lastName || '', contactNumber: p?.contactNumber || '', region: data.address?.region || '', province: data.address?.province || '', city: data.address?.city || '', barangay: data.address?.barangay || '' };

                await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, payload);
                setShowSuccessAnim(true);
                setTimeout(() => { setShowSuccessAnim(false); setAuthView('login'); }, 3500);
              } catch (err) {
                if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
                  setShowSuccessAnim(true);
                  return setTimeout(() => { setShowSuccessAnim(false); setAuthView('login'); }, 3500);
                }
                alert('Registration failed: ' + (err.response?.data?.message || err.message));
              }
            }}
          />
        </div>
      </section>
 
      {/* -- About Section -- */}
      <section id="about" className="relative py-24 bg-slate-50 text-slate-900 overflow-hidden border-t border-slate-200/60">
        {/* Glow Effects for Off-White Background */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
            About Us
          </h3>
          <p className="mt-4 mx-auto max-w-3xl text-lg text-slate-600 leading-relaxed text-balance">
            We created VenU to bridge the gap between event organizers and their attendees.
            Our tools simplify the coordination of logistics through integrated scheduling and analytics.
            By removing the complexity of planning, we help organizers focus on what matters most: delivering a memorable experience for their attendees.
          </p>
        </div>
      </section>

      {/* -- Features Section -- */}
      <section id="features" className="relative py-24 bg-slate-950 border-t border-slate-900 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Features</h3>
            <p className="text-slate-400 text-lg">Everything you need to host and discover events.</p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-center mb-16">
            {/* Mockup Image - Made Bigger */}
            <div className="w-full lg:w-5/12 flex justify-center">
                <img 
                  src={featuresMockup} 
                  alt="VenU App Features on Mobile" 
                  className="w-[120%] max-w-2xl h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-700 pointer-events-none scale-110" 
                  style={{ filter: "drop-shadow(0 0 50px rgba(168, 85, 247, 0.25))" }}
                />
            </div>

            {/* Feature Cards Grid */}
            <div className="w-full lg:w-7/12 grid gap-6 grid-cols-1 sm:grid-cols-2">
              {features.map((f) => (
                <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
              ))}
            </div>
          </div>

          {/* -- Vision & Mission Section -- */}
          <div className="mt-20 border-t border-slate-800/60 pt-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Vision Column */}
              <div className="bg-slate-900/50 hover:bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl border border-slate-800 hover:border-purple-500/50 shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 to-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                <h4 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-purple-500/20 text-purple-400 text-lg font-black border border-purple-500/20">/</span> 
                  Our Vision
                </h4>
                <p className="mt-5 text-slate-400 leading-relaxed text-sm md:text-base">
                  To become the definitive community ecosystem in the Philippines where every event-from local grassroots tournaments to life's most intimate celebrations-is easily discoverable, securely accessed, and effortlessly organized.
                </p>
              </div>

              {/* Mission Column */}
              <div className="bg-slate-900/50 hover:bg-slate-800/80 backdrop-blur-md p-8 rounded-2xl border border-slate-800 hover:border-purple-500/50 shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 to-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                <h4 className="text-xl font-bold text-white flex items-center gap-3">
                  <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-purple-500/20 text-purple-400 text-lg font-black border border-purple-500/20">/</span> 
                  Our Mission
                </h4>
                <p className="mt-5 text-slate-400 leading-relaxed text-sm md:text-base">
                  VENU empowers local communities by providing organizers with hyper-targeted location analytics, while giving attendees a seamless, single-screen platform to navigate real-time map discovery and private entry credentialing.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* -- Team Section -- */}
      <section id="team" className="relative py-24 bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url(${teamBg})` }}>
        {/* Overlay Masking */}
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-white font-bold text-3xl tracking-tight mb-2">MEET THE VENU TEAM</h3>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">The visionaries navigating community milestones.</p>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {['Wency Geraldo', 'Mark Joseph Braza', 'Prince Samuco', 'Yvhes Tolentino', 'Kate Nica Advincula'].map((name) => (
              <div key={name} className="bg-slate-900/50 hover:bg-purple-950/20 backdrop-blur-md border border-slate-800 p-6 rounded-2xl text-center hover:shadow-2xl hover:-translate-y-1 hover:border-purple-500/50 transition-all duration-300 group">
                <div className="h-20 w-20 mx-auto rounded-full bg-slate-800 border border-slate-700/80 group-hover:border-purple-500/50 group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
                  <User className="h-8 w-8 text-slate-500 group-hover:text-purple-400 transition-colors duration-300" />
                </div>
                <div className="mt-4 text-base font-semibold text-white group-hover:text-purple-400 transition-colors duration-300">{name}</div>
                <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Team Member</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- Footer Section -- */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 text-slate-400 text-sm py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Brand Info */}
            <div className="space-y-3">
              <div className="text-white font-bold text-lg flex items-center gap-2">
                <span className="h-7 w-7 rounded bg-purple-600 flex items-center justify-center text-xs font-black text-white">V</span>
                VENU
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Navigate community milestones. Connect hyper-locally.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-2">
                <MapPin className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                <span>Quezon City, Philippines</span>
              </div>
            </div>

            {/* Column 2: Platform Links */}
            <div>
              <h4 className="text-slate-200 font-semibold mb-4 text-xs uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-purple-400 transition-colors">Features</a></li>
                <li><a href="#map" className="hover:text-purple-400 transition-colors">Explore Map</a></li>
                <li><a href="#analytics" className="hover:text-purple-400 transition-colors">Community Analytics</a></li>
                <li><a href="#dashboard" className="hover:text-purple-400 transition-colors">Organizer Dashboard</a></li>
                <li className="pt-1">
                  <button
                    onClick={() => {
                      setShowAuth(true);
                      scrollToTop();
                    }}
                    className="mt-1 px-4 py-1.5 border border-purple-500/30 bg-transparent hover:bg-purple-600 hover:border-purple-500 rounded-full text-xs font-semibold text-white shadow-md hover:shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer inline-block"
                  >
                    Login / Sign Up
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Company Links */}
            <div>
              <h4 className="text-slate-200 font-semibold mb-4 text-xs uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#about" className="hover:text-purple-400 transition-colors">About Us</a></li>
                <li><a href="#vision" className="hover:text-purple-400 transition-colors">Vision & Mission</a></li>
                <li><a href="#privacy" className="hover:text-purple-400 transition-colors">Data Privacy Policy (NPC)</a></li>
                <li><a href="#contact" className="hover:text-purple-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Column 4: Legal & Credits */}
            <div>
              <h4 className="text-slate-200 font-semibold mb-4 text-xs uppercase tracking-wider">Legal & Credits</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#terms" className="hover:text-purple-400 transition-colors">Terms of Service</a></li>
                <li><a href="#cookies" className="hover:text-purple-400 transition-colors">Cookie Policy</a></li>
                <li><a href="#partnerships" className="hover:text-purple-400 transition-colors">Local Barangay Partnerships</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar Compliance Line */}
          <div className="border-t border-slate-900 pt-6 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <div>
              © 2026 VENU Technologies Inc. All rights reserved.
            </div>
            <div className="flex items-center gap-1">
              <span>In strict compliance with the Philippine Data Privacy Act of 2012.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}