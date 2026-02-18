import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ────────────────────────────────────────────────
// تنبيه مهم حول BASE URL للصور
// ────────────────────────────────────────────────
// بما أن REACT_APP_PRODUCT_URL = http://76.13.15.214:3002/api/products
// فإن STATIC_BASE_URL يجب أن يكون بدون /api/products
// لذلك نستخدم قيمة منفصلة أو نستخرج الجذر

// الطريقة المفضلة: إضافة متغير جديد في .env
// REACT_APP_STATIC_URL=http://76.13.15.214:3002
const STATIC_BASE_URL =
  process.env.REACT_APP_STATIC_URL ||
  process.env.REACT_APP_PRODUCT_URL?.replace(/\/api\/products\/?$/, '') ||
  'http://localhost:3002';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${process.env.REACT_APP_DISPLAY_URL}/products`,
          { timeout: 10000 } // حماية من التعليق الطويل
        );

        let fetchedProducts = [];

        const data = response.data;

        if (data?.success && Array.isArray(data.data)) {
          fetchedProducts = data.data;
        } else if (Array.isArray(data)) {
          fetchedProducts = data;
        } else if (data?.products && Array.isArray(data.products)) {
          fetchedProducts = data.products;
        } else {
          console.warn('Unexpected response format:', data);
        }

        if (isMounted) {
          setProducts(fetchedProducts);
        }
      } catch (err) {
        console.error('Error fetching products:', err);

        let errorMessage = 'تعذر تحميل المنتجات، حاول مرة أخرى لاحقًا';

        if (err.response) {
          const { status, data } = err.response;
          if (status === 404) {
            errorMessage = 'لم يتم العثور على المنتجات (تحقق من عنوان API)';
          } else if (status >= 500) {
            errorMessage = 'حدث خطأ في الخادم، يرجى المحاولة لاحقًا';
          } else if (data?.error) {
            errorMessage = data.error;
          } else {
            errorMessage = `خطأ ${status}: ${err.message}`;
          }
        } else if (err.request) {
          errorMessage = 'لا يمكن الوصول إلى الخادم. تأكد من تشغيل الخدمة.';
        } else {
          errorMessage = err.message;
        }

        if (isMounted) {
          setError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // ────────────────────────────────────────────────
  // حالات العرض
  // ────────────────────────────────────────────────

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
      <div className="no-products-message">
        لا توجد منتجات متاحة حاليًا
      </div>
    );
  }

  return (
    <div className="products-page">
      <h1 className="page-title">المنتجات المتاحة</h1>

      <div className="products-grid">
        {products.map((product) => (
          <article
            key={product._id}
            className="product-card"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.14)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            }}
          >
            <div className="product-image-wrapper">
              <img
                src={`${STATIC_BASE_URL}${product.imageUrl?.startsWith('/') ? '' : '/'}${product.imageUrl || ''}`}
                alt={product.name || 'صورة المنتج'}
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/320x240?text=غير+متوفرة';
                  e.target.alt = 'صورة غير متاحة';
                }}
                className="product-image"
              />
            </div>

            <div className="product-info">
              <h3 className="product-name">{product.name || 'بدون اسم'}</h3>

              <div className="product-price">
                {product.price?.toLocaleString('ar-EG') || product.price || '?'} جنيه
              </div>

              <p className="product-description">
                {product.description || 'لا يوجد وصف'}
              </p>

              <div className="product-meta">
                <small>
                  أضيف بواسطة:{' '}
                  {product.createdBy?.username ||
                    product.createdBy?.name ||
                    product.createdBy ||
                    'مستخدم'}
                </small>
                {product.createdAt && (
                  <small className="product-date">
                    {new Date(product.createdAt).toLocaleDateString('ar-EG')}
                  </small>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ProductsList;
