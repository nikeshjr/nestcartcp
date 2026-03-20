import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import { 
  PackageSearch, 
  LayoutGrid, 
  Laptop, 
  Shirt, 
  Home as HomeIcon, 
  Trophy, 
  BookOpen, 
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import api from '../services/api';
import '../style/Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';

  // Icon mapping for categories
  const getIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('elect')) return <Laptop size={20} />;
    if (lowerName.includes('fash')) return <Shirt size={20} />;
    if (lowerName.includes('home')) return <HomeIcon size={20} />;
    if (lowerName.includes('sport')) return <Trophy size={20} />;
    if (lowerName.includes('book')) return <BookOpen size={20} />;
    return <CheckCircle2 size={20} />;
  };
 
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const catRes = await api.get('/categories');
        setCategories(catRes.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    loadInitialData();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, categoryId]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12 };
        if (searchQuery) params.search = searchQuery;
        if (categoryId) params.categoryId = categoryId;
        
        const response = await api.get('/products', { params });
        const data = response.data;
        
        if (data && data.meta) {
          setProducts(data.data || []);
          setTotalPages(data.meta.totalPages || 1);
          setTotalProducts(data.meta.total || 0);
        } else {
          // Fallback if backend returns raw array
          setProducts(Array.isArray(data) ? data : []);
          setTotalPages(1);
          setTotalProducts(Array.isArray(data) ? data.length : 0);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [searchQuery, categoryId, page]);

  return (
    <div className="container animate-fade-in">
      <div className="home-hero mb-8">
        <div className="hero-content">
          <h1>
            {searchQuery ? `Search results for "${searchQuery}"` : 'Premium Gear for Your Lifestyle'}
          </h1>
          <p>
            {searchQuery 
              ? `Found ${totalProducts} products matching your search.` 
              : 'Discover our curated selection of high-quality essentials.'}
          </p>
        </div>
      </div>

      <div className="category-filter-section mb-10">
        <div className="filter-header mb-4">
          <div className="flex-center gap-2">
            <LayoutGrid size={18} color="var(--accent-yellow)" />
            <span className="filter-label">BROWSE CATEGORIES</span>
          </div>
          <div className="filter-divider"></div>
        </div>
        
        <div className="category-tabs-wrapper">
          <div className="category-tabs-scroll">
            <button 
              className={`cat-tab-premium ${!categoryId ? 'active' : ''}`}
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('category');
                setSearchParams(newParams);
              }}
            >
              <div className="tab-icon"><LayoutGrid size={20} /></div>
              <span className="tab-text">All Products</span>
            </button>
            
            {categories.map(cat => (
              <button 
                key={cat.id}
                className={`cat-tab-premium ${categoryId == cat.id ? 'active' : ''}`}
                onClick={() => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('category', cat.id);
                  setSearchParams(newParams);
                }}
              >
                <div className="tab-icon">{getIcon(cat.name)}</div>
                <div className="tab-label-group">
                  <span className="tab-text">{cat.name}</span>
                  <span className="tab-count">{cat._count?.products || 0}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .skeleton-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: 1rem;
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .skeleton-image {
          width: 100%;
          aspect-ratio: 1;
          border-radius: var(--radius-md);
        }
        .skeleton-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
      `}</style>

      {loading ? (
        <div className="grid-cols-auto">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton skeleton-image flex-center">
                <ImageIcon size={48} color="rgba(0,0,0,0.05)" />
              </div>
              <div className="skeleton-info">
                <div className="skeleton skeleton-title" style={{ width: '80%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '100%', height: '2.5rem', marginTop: '0.5rem' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid-cols-auto">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => { setPage(newPage); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        </>
      ) : (
        <div className="card text-center py-8" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <PackageSearch size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: 'white' }}>No products found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try searching for something else or browse all products.</p>
          <a 
            href="/" 
            className="btn btn-outline mt-4" 
            style={{ 
              alignSelf: 'center', 
              color: 'var(--accent-yellow)', 
              borderColor: 'var(--accent-yellow)' 
            }}
          >
            Clear Search
          </a>
        </div>
      )}
    </div>
  );
};

export default Home;
