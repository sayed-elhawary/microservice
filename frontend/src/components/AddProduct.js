// frontend/src/components/AddProduct.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMsg('يرجى تسجيل الدخول أولاً');
      setLoading(false);
      navigate('/login');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_PRODUCT_URL}/add`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccessMsg('تم إضافة المنتج بنجاح!');
      setTimeout(() => {
        navigate('/products');
      }, 1500);

      // reset form
      setName('');
      setPrice('');
      setDescription('');
      setImage(null);
    } catch (err) {
      console.error('خطأ أثناء إضافة المنتج:', err);

      let errorText = 'حدث خطأ غير متوقع';

      if (err.response) {
        // السيرفر رد (حتى لو خطأ)
        const { status, data } = err.response;
        if (status === 401) {
          errorText = 'جلسة غير صالحة - يرجى تسجيل الدخول مرة أخرى';
          localStorage.removeItem('token');
          setTimeout(() => navigate('/login'), 2000);
        } else if (status === 400) {
          errorText = data?.error || 'بيانات غير صحيحة (اسم، سعر، وصف، صورة مطلوبة)';
        } else if (data?.error) {
          errorText = data.error;
        } else {
          errorText = `خطأ ${status}: ${err.message}`;
        }
      } else if (err.request) {
        // الطلب تم إرساله لكن ما فيش رد
        errorText = 'لا يمكن الوصول إلى الخادم. تأكد من تشغيل الـ product-service';
      } else {
        errorText = err.message;
      }

      setErrorMsg(errorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <h2>إضافة منتج جديد</h2>

      {errorMsg && <div className="error-message">{errorMsg}</div>}
      {successMsg && <div className="success-message">{successMsg}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>اسم المنتج</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: هاتف ذكي"
            required
          />
        </div>

        <div className="form-group">
          <label>السعر (جنيه)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="مثال: 5999.99"
            required
          />
        </div>

        <div className="form-group">
          <label>الوصف</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اكتب وصف المنتج..."
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label>صورة المنتج</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'جاري الإضافة...' : 'إضافة المنتج'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
