// frontend/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // لو مفيش توكن → ما نعرضش الـ navbar أصلاً (لكن هنا بنستخدمه في مكان مناسب)
  if (!token) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/products" className="logo">
          متجري
        </Link>

        <div className="nav-links">
          <Link to="/products" className="nav-item">
            المنتجات
          </Link>

          <Link to="/add-product" className="nav-item">
            إضافة منتج
          </Link>

          <button onClick={handleLogout} className="logout-btn">
            تسجيل الخروج
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
