import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <header className="p-4 bg-white shadow flex justify-between items-center">
          <h1 className="text-2xl font-bold text-green-600">I have It</h1>
        </header>

        <main className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<h2 className="text-xl">Добре дошли в I have It</h2>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
