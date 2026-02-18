import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductsList.css'; // ← مهم: أضف هذا الملف (انظر أسفله)

// ────────────────────────────────────────────────
// BASE URL للصور الثابتة
// ────────────────────────────────────────────────
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
          { timeout: 12000 }
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
          const { status } = err.response;
          if (status === 404) errorMessage = 'لم يتم العثور على المنتجات';
          else if (status >= 500) errorMessage = 'مشكلة في الخادم';
          else if (err.response.data?.error) errorMessage = err.response.data.error;
        } else if (err.request) {
          errorMessage = 'لا يمكن الاتصال بالخادم';
        } else {
          errorMessage = err.message;
        }

        if (isMounted) setError(errorMessage);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="loading-container">جاري تحميل المنتجات...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (products.length === 0) {
    return <div className="no-products-message">لا توجد منتجات متاحة حاليًا</div>;
  }

  return (
    <div className="products-page">
      <h1 className="page-title">المنتجات المتاحة</h1>

      <div className="products-grid">
        {products.map((product) => (
          <article key={product._id} className="product-card">
            <div className="product-image-wrapper">
              <img
                src={`${STATIC_BASE_URL}${
                  product.imageUrl?.startsWith('/') ? '' : '/'
                }${product.imageUrl || ''}`}
                alt={product.name || 'صورة المنتج'}
                loading="lazy"
                className="product-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=غير+متوفرة';
                  e.target.alt = 'صورة غير متاحة';
                }}
              />
            </div>

            <div className="product-info">
              <h3 className="product-name">{product.name || 'بدون اسم'}</h3>

              <div className="product-price">
                {product.price?.toLocaleString('ar-EG') || product.price || '?'} جنيه
              </div>

              <p className="product-description">
                {product.description || 'لا يوجد وصف متاح'}
              </p>

              <div className="product-meta">
                <small className="added-by">
                  أضيف بواسطة:{' '}
                  {product.createdBy?.username ||
                    product.createdBy?.name ||
                    product.createdBy ||
                    'مستخدم'}
                </small>

                {product.createdAt && (
                  <small className="product-date">
                    {new Date(product.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
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
