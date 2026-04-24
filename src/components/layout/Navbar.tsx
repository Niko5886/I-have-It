import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function navClass({ isActive }: { isActive: boolean }) {
  return isActive
    ? 'text-emerald-700 font-semibold'
    : 'text-gray-700 hover:text-emerald-700 transition-colors';
}

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <NavLink to="/" className="text-xl font-bold text-emerald-700">
          I have It
        </NavLink>

        <nav className="flex items-center gap-4 text-sm">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>
          <NavLink to="/listings" className={navClass}>
            Browse Listings
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/my-listings" className={navClass}>
                My Listings
              </NavLink>
              <NavLink to="/create" className={navClass}>
                Create Listing
              </NavLink>
              <span className="hidden text-gray-500 md:block">{user?.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-lg bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-700"
              >
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
