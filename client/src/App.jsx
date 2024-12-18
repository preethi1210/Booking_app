import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import IndexPage from './pages/IndexPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PlacesFormPage from './pages/PlaceForm';
import PlacePage from './pages/PlacesPage';
import axios from 'axios';
import { UserContextProvider } from './UserContext';
import ProfilePage from './pages/ProfilePage';

axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/account" element={<ProfilePage />} />
          <Route path="/account/places" element={<PlacePage />} />
          <Route path="/account/places/new" element={<PlacesFormPage />} />
          <Route path="/places/:id" element={<PlacesFormPage />} />
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

export default App;
