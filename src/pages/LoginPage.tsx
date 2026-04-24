import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('demo@ihaveit.app');

  const from = (location.state as { from?: string } | null)?.from ?? '/my-listings';

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    login(email);
    navigate(from, { replace: true });
  };

  return (
    <section className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold">Login</h1>
      <p className="mt-2 text-sm text-gray-600">Влез в профила си за достъп до dashboard секциите.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-emerald-500 focus:ring"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
        >
          Login
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Нямаш акаунт?{' '}
        <Link to="/register" className="font-medium text-emerald-700 hover:underline">
          Register
        </Link>
      </p>
    </section>
  );
}
