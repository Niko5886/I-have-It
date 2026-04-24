import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('Demo User');
  const [email, setEmail] = useState('demo@ihaveit.app');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      await register(name, email);
      navigate('/my-listings', { replace: true });
    } catch {
      setError('Неуспешна регистрация. Опитай отново.');
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold">Register</h1>
      <p className="mt-2 text-sm text-gray-600">Създай профил и започни да публикуваш listing-и.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none ring-emerald-500 focus:ring"
          />
        </div>

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
          Register
        </button>
      </form>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <p className="mt-4 text-sm text-gray-600">
        Вече имаш акаунт?{' '}
        <Link to="/login" className="font-medium text-emerald-700 hover:underline">
          Login
        </Link>
      </p>
    </section>
  );
}
