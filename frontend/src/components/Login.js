// frontend/src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';           // سننشئ هذا الملف بعد قليل

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_AUTH_URL}/login`,
        { email, password }
      );

      localStorage.setItem('token', res.data.token);
      navigate('/products');           // أو '/add-product' حسب رغبتك
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'حدث خطأ أثناء تسجيل الدخول، حاول مرة أخرى.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="header">
          <h1>تسجيل الدخول</h1>
          <p>مرحبًا بعودتك! سجل دخولك للوصول إلى منتجاتك.</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email"> البريد الإلكتروني الخاص بك  </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder="example@email.com"
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">كلمة المرور</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="footer-links">
          <p>
            ليس لديك حساب؟{' '}
            <span className="link" onClick={() => navigate('/register')}>
              إنشاء حساب جديد
            </span>
          </p>
          {/* يمكن إضافة لاحقًا: نسيت كلمة المرور؟ */}
        </div>
      </div>
    </div>
  );
};

export default Login;
