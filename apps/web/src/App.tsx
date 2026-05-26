import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import BrowsePage from './pages/BrowsePage';
import AuthPage from './pages/AuthPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { TracksProvider } from './context/TracksContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TracksProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </TracksProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
