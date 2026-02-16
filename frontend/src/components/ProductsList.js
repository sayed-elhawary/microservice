import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // عنوان قاعدة خدمة المنتجات (يجي من .env)
  const PRODUCT_BASE_URL = process.env.REACT_APP_PRODUCT_URL || 'http://localhost:3002';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${process.env.REACT_APP_DISPLAY_URL}/products`
        );

        // التعامل مع أشكال الرد المختلفة
        let data = response.data;

        // لو الرد جاي في شكل { success: true, count: ..., data: [...] }
        if (data && data.success && Array.isArray(data.data)) {
          data = data.data;
        }
        // لو جاي مباشرة array
        else if (Array.isArray(data)) {
          // تمام
        }
        // لو فيه key تاني
        else if (data && Array.isArray(data.products)) {
          data = data.products;
        }
        else {
          data = [];
          console.warn('شكل الرد غير متوقع:', response.data);
        }

        setProducts(data);
      } catch (err) {
        console.error('خطأ أثناء جلب المنتجات:', err);
        setError(
          err.response?.data?.error ||
          err.message ||
          'تعذر تحميل المنتجات، حاول مرة أخرى لاحقًا'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        fontSize: '1.2rem',
        color: '#555'
      }}>
        جاري تحميل المنتجات...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        color: '#d32f2f',
        fontSize: '1.1rem'
      }}>
        {error}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        لا توجد منتجات متاحة حاليًا
      </div>
    );
  }

  return (
    <div style={{
      padding: '1.5rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{
        textAlign: 'center',
        marginBottom: '2rem',
        color: '#333'
      }}>
        المنتجات المتاحة
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {products.map((product) => (
          <div
            key={product._id}
            style={{
              border: '1px solid #eee',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              background: 'white',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <img
              src={`${PRODUCT_BASE_URL}${product.imageUrl}`}
              alt={product.name || 'منتج'}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x200?text=لا+توجد+صورة';
              }}
              style={{
                width: '100%',
                height: '220px',
                objectFit: 'cover',
                display: 'block'
              }}
            />

            <div style={{ padding: '1rem' }}>
              <h3 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.25rem',
                color: '#222'
              }}>
                {product.name}
              </h3>

              <p style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: '#d81b60',
                margin: '0.5rem 0'
              }}>
                {product.price} جنيه
              </p>

              <p style={{
                color: '#555',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                marginBottom: '0.75rem'
              }}>
                {product.description}
              </p>

              <small style={{ color: '#777', fontSize: '0.9rem' }}>
                أضيف بواسطة: {product.createdBy?.username || 'مستخدم'}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsList;
