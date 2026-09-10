import { useState, useMemo } from 'react';
import { 
  Search, 
  Tag, 
  ShoppingBag, 
  Eye, 
  X, 
  MessageCircle, 
  Sparkles,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { Product } from '../types';

interface ProductCatalogProps {
  products: Product[];
}

export function ProductCatalog({ products }: ProductCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return ['Todas', ...cats];
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    let list = products.filter(p => {
      const matchCat = selectedCategory === 'Todas' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });

    if (sortBy === 'price-asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    }

    return list;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
      case 'promotion':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded-md uppercase">Promoção</span>;
      case 'new':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded-md uppercase">Novo</span>;
      case 'featured':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-md uppercase">Destaque</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              Catálogo de Produtos
            </h2>
            <p className="text-xs text-slate-500">
              Explore nossa seleção exclusiva com preços e especificações detalhadas
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
            </span>
          </div>
        </div>

        {/* Search, Categories & Sorting */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="search-products-input"
              type="text"
              placeholder="Buscar por nome, tag ou especificação..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              id="sort-products-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">Ordenação Padrão</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
            </select>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`cat-filter-${cat}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              id={`product-card-${product.id}`}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Product Image */}
                <div 
                  className="relative aspect-4/3 overflow-hidden bg-slate-100 cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    {getStatusBadge(product.status)}
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-white/90 backdrop-blur-xs text-slate-800 rounded-md">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <h3 
                    onClick={() => setSelectedProduct(product)}
                    className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer"
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {product.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Action Footer */}
              <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {product.oldPrice && (
                    <span className="text-[11px] text-slate-400 line-through block">
                      {formatPrice(product.oldPrice)}
                    </span>
                  )}
                  <span className="text-lg font-black text-slate-900">
                    {formatPrice(product.price)}
                  </span>
                </div>

                <button
                  id={`btn-view-product-${product.id}`}
                  onClick={() => setSelectedProduct(product)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Detalhes</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-base">Nenhum produto encontrado</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Não encontramos resultados para sua busca ou categoria selecionada.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Todas');
            }}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Limpar filtros de busca
          </button>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="relative aspect-16/9 bg-slate-100 overflow-hidden">
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                id="btn-close-product-modal"
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-3 flex gap-2">
                {getStatusBadge(selectedProduct.status)}
                <span className="px-2.5 py-1 text-xs font-bold bg-white/95 text-slate-900 rounded-lg shadow-xs">
                  {selectedProduct.category}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-2xl font-black text-slate-900 leading-snug">
                  {selectedProduct.name}
                </h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-extrabold text-blue-600">
                    {formatPrice(selectedProduct.price)}
                  </span>
                  {selectedProduct.oldPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatPrice(selectedProduct.oldPrice)}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Descrição do Produto
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedProduct.description}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Tags & Especificações
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProduct.tags.map((t, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Fechar
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Olá! Tenho interesse no produto: ${selectedProduct.name} (${formatPrice(selectedProduct.price)})`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  Tenho Interesse / WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
