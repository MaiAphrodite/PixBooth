import './App.css';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Gallery from './pages/Gallery.jsx';
import Event from './pages/Event.jsx';
import Vendor from './pages/Vendor.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import LayoutPage from './pages/Layout.jsx';
import Booth from './pages/Booth.jsx';
import Editor from './pages/Editor.jsx';

export default function App() {
  return (
    <div className="page">
      <div className="page-inner">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/how" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/event" element={<Event />} />
          <Route path="/vendor" element={<Vendor />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/layout" element={<LayoutPage />} />
          <Route path="/booth" element={<Booth />} />
          <Route path="/editor" element={<Editor />} />
        </Routes>
        <Footer />
      </div>
    </div>
  );
}
