import React, { useState, useEffect } from 'react';
import axios from 'axios';

// نأخذ قيمة BASE URL من الـ .env
// مهم: REACT_APP_PRODUCT_URL يجب أن يكون http://76.13.15.214:3002   (بدون /api/products)
const STATIC_BASE_URL = process.env.REACT_APP_PRODUCT_URL || 'http://localhost:3002';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${process.env.REACT_APP_DISPLAY_URL}/products`
        );

        let fetchedProducts = [];

        // التعامل مع أشكال الرد المختلفة من الـ backend
        const data = response.data;

        if (data && data.success && Array.isArray(data.data)) {
          fetchedProducts = data.data;
        } else if (Array.isArray(data)) {
          fetchedProducts = data;
        } else if (data && Array.isArray(data.products)) {
          fetchedProducts = data.products;
        } else {
          console.warn('شكل الرد غير متوقع:', data);
        }

        setProducts(fetchedProducts);
      } catch (err) {
        console.error('خطأ أثناء جلب المنتجات:', err);

        let errorMessage = 'تعذر تحميل المنتجات، حاول مرة أخرى لاحقًا';

        if (err.response) {
          // السيرفر رد بكود خطأ
          const { status, data } = err.response;
          if (status === 404) {
            errorMessage = 'لم يتم العثور على المنتجات (خطأ في عنوان الـ API)';
          } else if (status >= 500) {
            errorMessage = 'مشكلة في الخادم، يرجى المحاولة لاحقًا';
          } else if (data?.error) {
            errorMessage = data.error;
          }
        } else if (err.request) {
          errorMessage = 'لا يمكن الاتصال بالخادم. تأكد من تشغيل الخدمة.';
        } else {
          errorMessage = err.message;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // تنظيف (اختياري - لو فيه اشتراكات أو cancel token)
    // return () => { cancel token هنا إذا استخدمت axios.CancelToken }
  }, []);

  // حالات التحميل / الخطأ / لا بيانات
  if (loading) {
    return (
      <div className="loading-container">
        جاري تحميل المنتجات...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="no-products">
        لا توجد منتجات متاحة حاليًا
      </div>
    );
  }

  return (
    <div className="products-container">
      <h1 className="page-title">المنتجات المتاحة</h1>

      <div className="products-grid">
        {products.map((product) => (
          <div
            key={product._id}
            className="product-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            }}
          >
            <img
              src={`${STATIC_BASE_URL}${product.imageUrl}`}
              alt={product.name || 'صورة المنتج'}
              loading="lazy"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x200?text=لا+توجد+صورة';
                e.target.alt = 'صورة غير متاحة';
              }}
              className="product-image"
            />

            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-price">{product.price?.toLocaleString() || product.price} جنيه</p>
              <p className="product-description">{product.description}</p>
              <small className="product-owner">
                أضيف بواسطة: {product.createdBy?.username || product.createdBy || 'مستخدم'}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsList;
