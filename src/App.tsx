import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { BrowseListingsPage } from './pages/BrowseListingsPage';
import { CreateListingPage } from './pages/CreateListingPage';
import { EditListingPage } from './pages/EditListingPage';
import { HomePage } from './pages/HomePage';
import { ListingDetailsPage } from './pages/ListingDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { MyListingsPage } from './pages/MyListingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RegisterPage } from './pages/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/listings" element={<BrowseListingsPage />} />
          <Route path="/listing/:id" element={<ListingDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/my-listings" element={<MyListingsPage />} />
            <Route path="/create" element={<CreateListingPage />} />
            <Route path="/edit/:id" element={<EditListingPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
