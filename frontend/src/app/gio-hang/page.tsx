'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { getImageUrl, formatCurrency } from '@/lib/utils';
import { ordersApi, addressesApi, productsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Search, User } from 'lucide-react';
import { toast } from 'sonner';

const generateDateOptions = () => {
  const options = [];
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    let label = '';
    let subLabel = '';
    if (i === 0) { label = 'Hôm nay'; subLabel = `${d.getDate()}/${d.getMonth() + 1}`; }
    else if (i === 1) { label = 'Ngày mai'; subLabel = `${d.getDate()}/${d.getMonth() + 1}`; }
    else { label = days[d.getDay()]; subLabel = `${d.getDate()}/${d.getMonth() + 1}`; }
    
    options.push({ value: dateStr, label, subLabel });
  }
  return options;
};


function QuickSearch({ onAdd }: { onAdd: (product: any) => void }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchRes, isLoading } = useQuery({
    queryKey: ['products-search', debouncedQuery],
    queryFn: () => productsApi.getAll({ search: debouncedQuery, limit: 10 }),
    enabled: debouncedQuery.length > 0,
  });

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-2 z-20">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <Input 
          className="w-full h-14 pl-12 pr-4 rounded-full border-gray-300 text-lg shadow-sm focus:border-green-500 focus:ring-green-500 bg-gray-50/50"
          placeholder="Tìm và thêm nhanh sản phẩm..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query && setIsOpen(true)}
        />
      </div>
      
      {isOpen && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Đang tìm...</div>
          ) : (searchRes?.data?.data?.length ?? 0) > 0 ? (
            <div className="divide-y">
              {searchRes?.data?.data?.map((p: any) => (
                <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <img src={getImageUrl(p.images?.[0]?.url)} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0 text-left">
                    <h4 className="font-medium text-gray-900 truncate text-sm md:text-base">{p.name}</h4>
                    <span className="text-green-600 font-bold text-sm md:text-base">{formatCurrency(p.price)}/{p.unit}</span>
                  </div>
                  <Button 
                    size="icon" 
                    className="rounded-full bg-green-100 text-green-700 hover:bg-green-600 hover:text-white shrink-0"
                    onClick={() => {
                      onAdd(p);
                      toast.success(`Đã thêm ${p.name}`);
                    }}
                  >
                    <Plus size={20} />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">Không tìm thấy sản phẩm nào</div>
          )}
        </div>
      )}
      
      {isOpen && <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />}
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, addItem } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const handleAddQuick = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      quantity: 1,
      imageUrl: product.images?.[0]?.url,
      unit: product.unit || 'kg',
      stock: product.stock || 0,
    });
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCustomAddress, setIsCustomAddress] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    note: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTime: '',
  });

  const { data: addressesRes } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressesApi.getAll(),
    enabled: !!user,
  });

  // Sync user info when it loads asynchronously
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: prev.customerName || user.name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if ((addressesRes?.data?.length ?? 0) > 0 && !formData.address && !isCustomAddress) {
      const defaultAddr = addressesRes?.data.find((a: any) => a.isDefault) || addressesRes?.data[0];
      setFormData(prev => ({ 
        ...prev, 
        address: defaultAddr.address, 
        customerName: defaultAddr.fullName || user?.name || prev.customerName || '', 
        phone: defaultAddr.phone || user?.phone || prev.phone || '' 
      }));
    }
  }, [addressesRes, isCustomAddress, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Giỏ hàng trống');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmOrder = async () => {
    try {
      setIsSubmitting(true);
      const orderData = {
        ...formData,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const res = await ordersApi.create(orderData);
      
      // Xóa cache để làm mới danh sách đơn hàng
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      
      clearCart();
      setShowConfirmModal(false);
      toast.success('Đặt hàng thành công!');
      
      // Chuyển đến trang chi tiết đơn hàng
      router.push(`/dat-hang-thanh-cong?orderNumber=${res.data.orderNumber}`);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi đặt hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Mua sắm nhanh chóng</h1>
        <QuickSearch onAdd={handleAddQuick} />
        
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 mt-12">
          <ShoppingBag size={40} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Giỏ hàng của bạn đang trống</h2>
        <p className="text-gray-600 mb-8">Bạn có thể tìm kiếm sản phẩm ở thanh trên hoặc tiếp tục mua sắm nhé!</p>
        <Button size="lg" className="bg-green-600 hover:bg-green-700 rounded-full px-8" asChild>
          <Link href="/san-pham">Đến trang sản phẩm</Link>
        </Button>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shippingFee = subtotal >= 200000 ? 0 : 20000;
  const total = subtotal + shippingFee;

  return (
    <div className="bg-gray-50/50 min-h-screen pb-12">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Giỏ hàng của bạn ({items.length} sản phẩm)</h1>
          <QuickSearch onAdd={handleAddQuick} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="flex-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 text-sm font-medium text-gray-500">
                <div className="col-span-8">Sản phẩm</div>
                <div className="col-span-4 text-center">Số lượng</div>
              </div>

              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4">
                    <div className="flex gap-3 sm:gap-4 items-center overflow-hidden mr-2">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-gray-50 rounded-xl overflow-hidden border">
                        <img 
                          src={getImageUrl(item.imageUrl)} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <Link href={`/san-pham/${item.slug}`} className="font-medium text-gray-900 hover:text-green-600 truncate text-sm sm:text-base">
                          {item.name}
                        </Link>
                        <div className="text-sm text-gray-500 mt-1">
                          Đơn vị: {item.unit}
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-xs sm:text-sm text-red-500 hover:text-red-700 flex items-center gap-1 w-fit mt-1.5"
                        >
                          <Trash2 size={14} /> Xóa
                        </button>
                      </div>
                    </div>
                    
                    <div className="shrink-0 flex items-center border rounded-full overflow-hidden h-8 w-24 sm:h-9 sm:w-28 bg-white">
                        <button 
                          className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-green-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <div className="flex-1 text-center font-medium text-sm border-x">{item.quantity}</div>
                        <button 
                          className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-green-600 transition-colors"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center px-2">
              <Button variant="ghost" className="text-gray-500" asChild>
                <Link href="/san-pham">← Tiếp tục mua sắm</Link>
              </Button>
              <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={clearCart}>
                Xóa toàn bộ giỏ hàng
              </Button>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="font-bold text-lg text-gray-900 mb-6 pb-4 border-b">Thông tin giao hàng</h2>
              
              {!isAuthenticated ? (
                <div className="text-center py-8">
                  <div className="bg-orange-50 text-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Bạn chưa đăng nhập</h3>
                  <p className="text-gray-500 text-sm mb-6">Vui lòng đăng nhập hoặc tạo tài khoản để có thể tiến hành đặt hàng và theo dõi đơn hàng dễ dàng.</p>
                  <div className="flex flex-col gap-3">
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700 h-11 rounded-xl">
                      <Link href="/dang-nhap?redirect=/gio-hang">Đăng nhập ngay</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full h-11 rounded-xl">
                      <Link href="/dang-ky?redirect=/gio-hang">Đăng ký tài khoản mới</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Họ và tên <span className="text-red-500">*</span></Label>
                    <Input 
                      id="customerName" 
                      name="customerName"
                      required 
                      value={formData.customerName}
                      onChange={handleChange}
                      placeholder="Nhập họ tên người nhận"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại <span className="text-red-500">*</span></Label>
                    <Input 
                      id="phone" 
                      name="phone"
                      required 
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Địa chỉ giao hàng <span className="text-red-500">*</span></Label>
                    
                    {user && (addressesRes?.data?.length ?? 0) > 0 && (
                      <div className="space-y-3 mb-3">
                        <div className="grid gap-3">
                          {addressesRes?.data.map((addr: any) => (
                            <label key={addr.id} className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                              formData.address === addr.address && !isCustomAddress
                                ? 'border-green-500 bg-green-50 ring-1 ring-green-500' 
                                : 'hover:border-green-200'
                            }`}>
                              <input 
                                type="radio" 
                                name="savedAddress" 
                                className="mt-1 text-green-600 focus:ring-green-500"
                                checked={formData.address === addr.address && !isCustomAddress}
                                onChange={() => {
                                  setIsCustomAddress(false);
                                  setFormData({
                                    ...formData, 
                                    address: addr.address, 
                                    customerName: addr.fullName || user?.name || '', 
                                    phone: addr.phone || user?.phone || ''
                                  });
                                }}
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm">
                                  {addr.fullName || user?.name} - {addr.phone || user?.phone}
                                </div>
                                <div className="text-gray-500 text-sm mt-0.5">{addr.address}</div>
                                {addr.isDefault && (
                                  <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded mt-1">
                                    Mặc định
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                          
                          <label className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                            isCustomAddress
                              ? 'border-green-500 bg-green-50 ring-1 ring-green-500' 
                              : 'hover:border-green-200'
                          }`}>
                            <input 
                              type="radio" 
                              name="savedAddress" 
                              className="mt-1 text-green-600 focus:ring-green-500"
                              checked={isCustomAddress}
                              onChange={() => {
                                setIsCustomAddress(true);
                                setFormData({...formData, address: ''});
                              }}
                            />
                            <div className="font-medium text-gray-900 text-sm pt-0.5">
                              Giao đến địa chỉ khác
                            </div>
                          </label>
                        </div>
                      </div>
                    )}

                    {(!user || (addressesRes?.data?.length ?? 0) === 0 || isCustomAddress) && (
                      <Textarea 
                        id="address" 
                        name="address"
                        required 
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Nhập địa chỉ nhận hàng chi tiết..."
                        className="resize-none"
                        rows={3}
                      />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryDate">Ngày giao</Label>
                      <Input 
                        id="deliveryDate" 
                        type="date"
                        name="deliveryDate"
                        value={formData.deliveryDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="deliveryTime">Giờ giao (Không bắt buộc)</Label>
                      <Input 
                        id="deliveryTime"
                        name="deliveryTime"
                        value={formData.deliveryTime}
                        onChange={handleChange}
                        placeholder="VD: 08:00, buổi sáng..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Ghi chú thêm</Label>
                    <Input 
                      id="note" 
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      placeholder="VD: Gọi trước khi giao..."
                    />
                  </div>

                  <div className="pt-4 border-t mt-6">
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 rounded-full bg-green-600 hover:bg-green-700 text-base"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                      {!isSubmitting && <ArrowRight className="ml-2 w-5 h-5" />}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận đơn hàng</DialogTitle>
            <DialogDescription>
              Vui lòng kiểm tra lại thông tin giao hàng trước khi đặt đơn.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
              <span className="text-gray-500 col-span-1">Người nhận:</span>
              <span className="font-medium col-span-2">{formData.customerName} - {formData.phone}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
              <span className="text-gray-500 col-span-1">Địa chỉ giao:</span>
              <span className="font-medium col-span-2">{formData.address}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm border-b pb-2">
              <span className="text-gray-500 col-span-1">Lịch giao:</span>
              <span className="font-medium col-span-2 text-green-600">{formData.deliveryTime} | {formData.deliveryDate.split('-').reverse().join('/')}</span>
            </div>
            
            {/* Chi tiết sản phẩm */}
            <div className="border-b pb-2">
              <span className="text-gray-500 text-sm mb-2 block">Sản phẩm ({items.length}):</span>
              <div className="max-h-[120px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="font-medium text-gray-800 line-clamp-1 mr-2">{item.quantity} x {item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} disabled={isSubmitting}>
              Quay lại
            </Button>
            <Button onClick={handleConfirmOrder} className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
