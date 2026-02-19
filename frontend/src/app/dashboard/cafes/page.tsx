'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import {
  StarIcon as StarIconSolid,
  MapPinIcon,
  ClockIcon,
  ShoppingCartIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon
} from '@heroicons/react/24/solid';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getImageUrl = (imagePath: string | undefined | null): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  const baseUrl = API_URL.replace('/api', '').replace(/\/$/, '');
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${cleanPath}`;
};

interface Cafe {
  id: string;
  name: string;
  description?: string;
  location: string;
  phone?: string;
  email?: string;
  imageUrl?: string;
  openingHours?: string;
  averageRating: number;
  ownerId?: string;
  menus: MenuItem[];
  deals: Deal[];
  _count: { ratings: number };
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  isFeatured?: boolean;
}

interface Deal {
  id: string;
  title: string;
  description?: string;
  discount?: number;
  menuItemIds?: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

interface CartItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export default function CafesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [showOrderHistory, setShowOrderHistory] = useState(false);

  useEffect(() => {
    fetchCafes();
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(`${API_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
        params: { limit: 5 }
      });
      if (response.data.success && response.data.orders) {
        setRecentOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch recent orders:', error);
    }
  };

  const fetchCafes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCafes([]);
        return;
      }
      const response = await axios.get(`${API_URL}/cafes`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
        timeout: 15000,
        validateStatus: (status) => status < 500
      });
      if (response.data.success) {
        const cafesData = response.data.cafes || [];
        setCafes(cafesData);
        if (cafesData.length > 0 && !selectedCafe) setSelectedCafe(cafesData[0]);
      } else {
        setCafes([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch cafes:', error);
      toast.error('Failed to load cafes.');
      setCafes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCafeSelect = async (cafe: Cafe) => {
    setSelectedCafe(cafe);
    setCart([]);
    setSelectedCategory('All');
  };

  const addToCart = (item: MenuItem) => {
    if (!item.isAvailable) {
      toast.error('Item unavailable');
      return;
    }
    const existingItem = cart.find(c => c.menuId === item.id);
    if (existingItem) {
      setCart(cart.map(c => c.menuId === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { menuId: item.id, name: item.name, price: Number(item.price), quantity: 1 }]);
    }
    toast.success('Added to cart');
  };

  const updateQuantity = (menuId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.menuId === menuId) {
        const newQuantity = item.quantity + delta;
        return newQuantity <= 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (menuId: string) => {
    setCart(cart.filter(item => item.menuId !== menuId));
  };

  const getTotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePlaceOrder = async () => {
    if (!selectedCafe || cart.length === 0) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in');
        return;
      }
      const response = await axios.post(`${API_URL}/orders`, {
        cafeId: selectedCafe.id,
        items: cart.map(item => ({ menuId: item.menuId, quantity: item.quantity, notes: item.notes })),
        notes: orderNotes
      }, { headers: { Authorization: `Bearer ${token.trim()}` } });

      if (response.data.success) {
        toast.success('Order placed successfully!');
        setCart([]);
        setOrderNotes('');
        setShowCart(false);
        fetchRecentOrders();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  const handleDealOrder = (deal: Deal) => {
    if (!selectedCafe) return;
    try {
      const menuItemIds = deal.menuItemIds ? JSON.parse(deal.menuItemIds) : [];
      if (menuItemIds.length === 0) {
        toast.error('Deal unavailable');
        return;
      }
      const dealItems = selectedCafe.menus.filter(m => menuItemIds.includes(m.id) && m.isAvailable);
      if (dealItems.length === 0) {
        toast.error('Deal items unavailable');
        return;
      }
      dealItems.forEach(item => {
        const existingItem = cart.find(c => c.menuId === item.id);
        if (existingItem) {
          setCart(prev => prev.map(c => c.menuId === item.id ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
          setCart(prev => [...prev, { menuId: item.id, name: item.name, price: Number(item.price), quantity: 1 }]);
        }
      });
      toast.success(`Added deal items to cart`);
      setShowCart(true);
    } catch {
      toast.error('Failed to add deal');
    }
  };

  const formatHours = (hours?: string) => {
    if (!hours) return 'Check cafe';
    try {
      const parsed = JSON.parse(hours);
      return typeof parsed === 'string' ? parsed : 'See details';
    } catch { return hours; }
  };

  const categories = selectedCafe ? ['All', ...new Set(selectedCafe.menus.map(m => m.category))] : [];
  const featuredMenus = selectedCafe ? selectedCafe.menus.filter(m => m.isFeatured && m.isAvailable) : [];
  const filteredMenus = selectedCafe ? selectedCafe.menus.filter(m => selectedCategory === 'All' || m.category === selectedCategory) : [];

  if (loading) return <div className="flex h-96 items-center justify-center text-muted-foreground animate-pulse">Loading cafes...</div>;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-6 p-1">
      {/* Left Sidebar - Cafe List */}
      <div className="w-full lg:w-80 flex-shrink-0 bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Campus Cafés</h2>
            {recentOrders.length > 0 && (
              <button onClick={() => setShowOrderHistory(!showOrderHistory)} className="text-xs text-primary font-medium hover:underline">
                {showOrderHistory ? 'Hide' : 'Show'} Orders
              </button>
            )}
          </div>
        </div>

        {showOrderHistory && recentOrders.length > 0 && (
          <div className="p-3 bg-secondary/50 border-b border-border/50 max-h-48 overflow-y-auto">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Recent Orders</h3>
            <div className="space-y-2">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="p-2 bg-card rounded-lg border border-border/50 text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-foreground truncate w-32">{order.cafe?.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()} • {Number(order.totalAmount).toFixed(0)} PKR</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {cafes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No Cafés Available</div>
          ) : (
            cafes.map((cafe) => (
              <button
                key={cafe.id}
                onClick={() => handleCafeSelect(cafe)}
                className={`w-full p-4 text-left transition-all border-b border-border/30 last:border-0 hover:bg-secondary/50 ${selectedCafe?.id === cafe.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 flex-shrink-0 rounded-xl overflow-hidden bg-secondary">
                    {cafe.imageUrl ? (
                      <img src={getImageUrl(cafe.imageUrl) || ''} alt="" className="h-full w-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-bold text-lg">{cafe.name[0]}</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-semibold text-sm truncate ${selectedCafe?.id === cafe.id ? 'text-primary' : 'text-foreground'}`}>{cafe.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-0.5"><StarIconSolid className="h-3 w-3 text-amber-400" /> {cafe.averageRating.toFixed(1)}</span>
                      <span>•</span>
                      <span className="truncate">{cafe.location}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Details */}
      <div className="flex-1 bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col relative">
        {selectedCafe ? (
          <div className="h-full overflow-y-auto">
            {/* Hero Header */}
            <div className="relative h-48 sm:h-64 group">
              {selectedCafe.imageUrl ? (
                <img src={getImageUrl(selectedCafe.imageUrl) || ''} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-violet-600" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-bold mb-2 tracking-tight">{selectedCafe.name}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/90">
                      <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg"><StarIconSolid className="h-4 w-4 text-amber-400" /> {selectedCafe.averageRating.toFixed(1)}</span>
                      <span className="flex items-center gap-1"><MapPinIcon className="h-4 w-4" /> {selectedCafe.location}</span>
                      <span className="flex items-center gap-1"><ClockIcon className="h-4 w-4" /> {formatHours(selectedCafe.openingHours)}</span>
                    </div>
                  </div>
                  {selectedCafe.ownerId && (
                    <button onClick={() => router.push(`/dashboard/messages?userId=${selectedCafe.ownerId}`)} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-white/20 flex items-center gap-2">
                      <ChatBubbleLeftRightIcon className="h-4 w-4" /> Message
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Featured */}
              {featuredMenus.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><StarIconSolid className="h-5 w-5 text-amber-400" /> Popular Items</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {featuredMenus.map((item) => (
                      <div key={item.id} className="group relative bg-secondary/30 rounded-xl p-3 border border-border/50 hover:border-primary/30 transition-all hover:bg-secondary/50 flex gap-3 items-center">
                        <div className="h-16 w-16 rounded-lg bg-card border border-border overflow-hidden flex-shrink-0">
                          {item.imageUrl ? <img src={getImageUrl(item.imageUrl) || ''} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center bg-secondary text-2xl">🍔</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-sm truncate">{item.name}</h3>
                          <p className="text-primary font-bold text-sm mt-0.5">{Number(item.price).toFixed(0)} PKR</p>
                        </div>
                        <button onClick={() => addToCart(item)} className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 transition-transform"><PlusIcon className="h-5 w-5" /></button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Deals */}
              {selectedCafe.deals.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold text-foreground mb-4">Active Deals</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCafe.deals.map(deal => (
                      <div key={deal.id} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/80 to-violet-600 text-white p-5 shadow-lg shadow-primary/20">
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg">{deal.title}</h3>
                            <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-xs font-bold">{deal.discount}% OFF</span>
                          </div>
                          <p className="text-white/80 text-sm mb-4 line-clamp-2">{deal.description}</p>
                          <button onClick={() => handleDealOrder(deal)} className="w-full py-2 bg-white text-primary font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors shadow-sm">Add to Order</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Menu Categories & Items */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-foreground">Full Menu</h2>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {categories.map(cat => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  {filteredMenus.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-card hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-xl bg-secondary border border-border/50 overflow-hidden flex-shrink-0">
                          {item.imageUrl ? <img src={getImageUrl(item.imageUrl) || ''} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-2xl">🥘</div>}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{item.name}</h3>
                            {!item.isAvailable && <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-bold">Sold Out</span>}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                          <p className="text-sm font-bold text-primary mt-1">{Number(item.price).toFixed(0)} PKR</p>
                        </div>
                      </div>
                      <button onClick={() => addToCart(item)} disabled={!item.isAvailable} className="h-10 w-10 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        <PlusIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-4"><MapPinIcon className="h-8 w-8 opacity-50" /></div>
            <p className="text-lg font-medium">Select a Café</p>
            <p className="text-sm">Choose a venue from the list to see their menu and deals.</p>
          </div>
        )}

        {/* Floating Cart Button */}
        {cart.length > 0 && (
          <div className="absolute bottom-6 right-6 z-10">
            <button onClick={() => setShowCart(true)} className="group flex items-center gap-3 bg-primary text-primary-foreground px-6 py-4 rounded-full shadow-xl shadow-primary/30 hover:scale-105 transition-all">
              <div className="relative">
                <ShoppingCartIcon className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 h-5 w-5 bg-white text-primary rounded-full text-xs font-bold flex items-center justify-center">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <span className="font-bold pr-1">View Cart</span>
            </button>
          </div>
        )}
      </div>

      {/* Glassmorphic Cart Overlay */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="relative w-full sm:w-[400px] h-full bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/30">
              <h2 className="text-xl font-bold text-foreground">Your Order</h2>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground"><XMarkIcon className="h-6 w-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.map(item => (
                <div key={item.menuId} className="flex gap-4">
                  <div className="h-10 w-10 flex items-center justify-center font-bold text-foreground bg-secondary rounded-lg text-sm">x{item.quantity}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground text-sm">{item.name}</h4>
                    <p className="text-muted-foreground text-xs">{Number(item.price).toFixed(0)} PKR</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-bold text-primary text-sm">{(item.price * item.quantity).toFixed(0)}</p>
                    <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
                      <button onClick={() => updateQuantity(item.menuId, -1)} className="p-1 hover:bg-background rounded"><MinusIcon className="h-3 w-3" /></button>
                      <button onClick={() => updateQuantity(item.menuId, 1)} className="p-1 hover:bg-background rounded"><PlusIcon className="h-3 w-3" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-border bg-secondary/10 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">Special Instructions</label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Allergies? Extra sauce?"
                  className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none resize-none h-20"
                />
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-foreground pt-2">
                <span>Total</span>
                <span className="text-2xl">{getTotal().toFixed(0)} <span className="text-sm font-medium text-muted-foreground">PKR</span></span>
              </div>
              <button onClick={handlePlaceOrder} className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02]">
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
