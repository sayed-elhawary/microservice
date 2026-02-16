// frontend/src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';  // لو هتعمل styling منفصل

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_AUTH_URL}/register`,
        { username, email, password }
      );

      setSuccess('تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'حدث خطأ أثناء التسجيل، حاول مرة أخرى.'
      );
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>إنشاء حساب جديد</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              placeholder="اكتب اسم المستخدم"
              required
            />
          </div>

          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة مرور قوية"
              required
            />
          </div>

          <button type="submit" className="register-btn">
            تسجيل حساب
          </button>
        </form>

        <p className="login-link">
          لديك حساب بالفعل؟ <span onClick={() => navigate('/login')}>تسجيل الدخول</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
