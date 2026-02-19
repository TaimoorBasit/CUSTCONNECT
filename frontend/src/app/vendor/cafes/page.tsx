'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { vendorService } from '@/services/vendorService';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to construct image URL - SIMPLIFIED
const getImageUrl = (imagePath: string | undefined | null): string | null => {
  if (!imagePath) return null;

  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Get base URL (remove /api from API_URL)
  const baseUrl = API_URL.replace('/api', '').replace(/\/$/, '');

  // Ensure path starts with /
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  // Construct full URL
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
  isActive: boolean;
  menus: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    imageUrl?: string;
    isAvailable: boolean;
    isFeatured?: boolean;
  }>;
  deals: Array<{
    id: string;
    title: string;
    description?: string;
    discount?: number;
    menuItemIds?: string;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
  }>;
  university?: {
    id: string;
    name: string;
    city: string;
  };
}

export default function VendorCafesPage() {
  const { user } = useAuth();
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);

  useEffect(() => {
    fetchCafe();
  }, []);

  const fetchCafe = async () => {
    try {
      setLoading(true);
      const cafeData = await vendorService.getMyCafe();
      setCafe(cafeData);
    } catch (error: any) {
      console.error('Failed to fetch cafe:', error);
      if (error.message?.includes('No café assigned')) {
        // Show friendly message for no cafe assigned
        setCafe(null);
      } else {
        toast.error(error.message || 'Failed to load café');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMenu = () => {
    if (cafe) {
      setShowMenuModal(true);
    }
  };

  const handleUpdateDeal = () => {
    if (cafe) {
      setShowDealModal(true);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-900">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Café</h1>
          <p className="text-gray-500">Manage your café menu items and deals.</p>
        </div>
      </div>

      {!cafe ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No café assigned</h3>
          <p className="mt-1 text-sm text-gray-500">
            Contact super admin to get a café assigned to your account.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                {cafe.imageUrl && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                      src={getImageUrl(cafe.imageUrl) || ''}
                      alt={cafe.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error('❌ Image failed to load:', target.src);
                        // Hide broken image
                        target.style.display = 'none';
                      }}
                      onLoad={() => {
                        // Image loaded successfully
                      }}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{cafe.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">{cafe.location}</p>
                  {cafe.description && (
                    <p className="mt-2 text-sm text-gray-600">{cafe.description}</p>
                  )}
                  {cafe.university && (
                    <p className="mt-1 text-sm text-gray-500">
                      {cafe.university.name} - {cafe.university.city}
                    </p>
                  )}
                </div>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${cafe.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
                  }`}
              >
                {cafe.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Upload Cafe Image */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Café Image
            </label>
            <CafeImageUpload cafeId={cafe.id} currentImageUrl={cafe.imageUrl} onSuccess={fetchCafe} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Menu Items</p>
              <p className="mt-1 text-3xl font-bold text-blue-600">
                {cafe.menus.length}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Active Deals</p>
              <p className="mt-1 text-3xl font-bold text-purple-600">
                {cafe.deals.filter(d => d.isActive).length}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleUpdateMenu}
              className="flex-1 inline-flex justify-center items-center rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              <PencilIcon className="mr-2 h-5 w-5" />
              Manage Menu ({cafe.menus.length} items)
            </button>
            <button
              onClick={handleUpdateDeal}
              className="flex-1 inline-flex justify-center items-center rounded-md bg-purple-600 px-6 py-3 text-sm font-medium text-white hover:bg-purple-700"
            >
              <PlusIcon className="mr-2 h-5 w-5" />
              Manage Deals ({cafe.deals.filter(d => d.isActive).length} active)
            </button>
          </div>
        </div>
      )}

      {/* Menu Management Modal */}
      {showMenuModal && cafe && (
        <MenuManagementModal
          cafe={cafe}
          onClose={() => {
            setShowMenuModal(false);
          }}
          onSave={fetchCafe}
        />
      )}

      {/* Deal Management Modal */}
      {showDealModal && cafe && (
        <DealManagementModal
          cafe={cafe}
          onClose={() => {
            setShowDealModal(false);
          }}
          onSave={fetchCafe}
        />
      )}
    </div>
  );
}

// Menu Management Modal Component
function MenuManagementModal({
  cafe,
  onClose,
  onSave,
}: {
  cafe: Cafe;
  onClose: () => void;
  onSave: () => void;
}) {
  const [menus, setMenus] = useState(cafe.menus);
  const [newMenu, setNewMenu] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    isAvailable: true,
    isFeatured: false,
  });
  const [uploadingMenuImages, setUploadingMenuImages] = useState<Record<string, boolean>>({});

  const handleAddMenu = () => {
    if (!newMenu.name || !newMenu.price || !newMenu.category) {
      toast.error('Please fill all required fields');
      return;
    }
    setMenus([
      ...menus,
      {
        id: `temp-${Date.now()}`,
        ...newMenu,
        price: parseFloat(newMenu.price),
        imageUrl: newMenu.imageUrl || undefined,
      },
    ]);
    setNewMenu({ name: '', description: '', price: '', category: '', imageUrl: '', isAvailable: true, isFeatured: false });
  };

  const handleRemoveMenu = (id: string) => {
    setMenus(menus.filter(m => m.id !== id));
  };

  const handleMenuImageUpload = async (menuId: string, file: File) => {
    try {
      setUploadingMenuImages(prev => ({ ...prev, [menuId]: true }));
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${API_URL}/cafes/menu/${menuId}/image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type - axios will set it automatically with boundary
          },
          timeout: 30000, // 30 second timeout for file uploads
        }
      );

      if (response.data.success) {
        setMenus(menus.map(m =>
          m.id === menuId
            ? { ...m, imageUrl: response.data.menu.imageUrl }
            : m
        ));
        toast.success('Menu item image uploaded');
      }
    } catch (error: any) {
      console.error('Failed to upload menu image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingMenuImages(prev => ({ ...prev, [menuId]: false }));
    }
  };

  const handleSave = async () => {
    try {
      await vendorService.updateCafeMenu(cafe.id, menus.map(m => ({
        name: m.name,
        description: m.description || undefined,
        price: typeof m.price === 'string' ? parseFloat(m.price) : m.price,
        category: m.category,
        imageUrl: m.imageUrl || undefined,
        isAvailable: m.isAvailable,
        isFeatured: m.isFeatured || false
      })));
      toast.success('Menu updated successfully');
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Failed to update menu:', error);
      toast.error(error.message || 'Failed to update menu');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Manage Menu - {cafe.name}</h2>

          {/* Add New Menu Item */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-3 text-gray-900">Add New Menu Item</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Item Name"
                value={newMenu.name}
                onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
              />
              <input
                type="text"
                placeholder="Category (e.g., Beverages, Food)"
                value={newMenu.category}
                onChange={(e) => setNewMenu({ ...newMenu, category: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={newMenu.price}
                onChange={(e) => setNewMenu({ ...newMenu, price: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newMenu.description}
                onChange={(e) => setNewMenu({ ...newMenu, description: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
              />
            </div>
            <button
              onClick={handleAddMenu}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Item
            </button>
          </div>

          {/* Menu Items List */}
          <div className="max-h-96 overflow-y-auto">
            {menus.map((menu) => (
              <div key={menu.id} className="flex items-center gap-3 p-3 border-b">
                {menu.imageUrl && (
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={`${API_URL.replace('/api', '')}${menu.imageUrl}`}
                      alt={menu.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-gray-900">{menu.name}</h4>
                    <span className="text-xs text-gray-500">{menu.category}</span>
                    <span className="text-sm font-semibold text-gray-900">PKR {menu.price}</span>
                  </div>
                  {menu.description && (
                    <p className="text-sm text-gray-500 mt-1">{menu.description}</p>
                  )}
                  <div className="mt-2 flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={menu.isFeatured || false}
                        onChange={(e) => {
                          setMenus(menus.map(m =>
                            m.id === menu.id
                              ? { ...m, isFeatured: e.target.checked }
                              : m
                          ));
                        }}
                        className="h-4 w-4 text-yellow-600 rounded"
                      />
                      <span className="font-medium">⭐ Featured (Most Liked)</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={menu.isAvailable}
                        onChange={(e) => {
                          setMenus(menus.map(m =>
                            m.id === menu.id
                              ? { ...m, isAvailable: e.target.checked }
                              : m
                          ));
                        }}
                        className="h-4 w-4 text-green-600 rounded"
                      />
                      <span>Available</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && !menu.id.startsWith('temp-')) {
                          handleMenuImageUpload(menu.id, file);
                        } else if (file && menu.id.startsWith('temp-')) {
                          // For new items, we'll upload after saving
                          toast('Please save the menu first, then upload images');
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                      id={`menu-image-${menu.id}`}
                      disabled={uploadingMenuImages[menu.id] || menu.id.startsWith('temp-')}
                    />
                    <label
                      htmlFor={`menu-image-${menu.id}`}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer border border-blue-300 rounded hover:bg-blue-50"
                    >
                      <PhotoIcon className="h-3 w-3 mr-1" />
                      {uploadingMenuImages[menu.id] ? 'Uploading...' : menu.imageUrl ? 'Change' : 'Add Image'}
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveMenu(menu.id)}
                  className="ml-4 text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Deal Management Modal Component
function DealManagementModal({
  cafe,
  onClose,
  onSave,
}: {
  cafe: Cafe;
  onClose: () => void;
  onSave: () => void;
}) {
  const [deals, setDeals] = useState(cafe.deals);
  const [newDeal, setNewDeal] = useState({
    title: '',
    description: '',
    discount: '',
    validFrom: '',
    validUntil: '',
    menuItemIds: [] as string[],
    isActive: true,
  });

  const handleAddDeal = () => {
    if (!newDeal.title || !newDeal.validFrom || !newDeal.validUntil) {
      toast.error('Please fill all required fields');
      return;
    }
    if (newDeal.menuItemIds.length === 0) {
      toast.error('Please select at least one menu item for this deal');
      return;
    }
    setDeals([
      ...deals,
      {
        id: `temp-${Date.now()}`,
        ...newDeal,
        discount: newDeal.discount ? parseFloat(newDeal.discount) : undefined,
        menuItemIds: JSON.stringify(newDeal.menuItemIds),
      },
    ]);
    setNewDeal({
      title: '',
      description: '',
      discount: '',
      validFrom: '',
      validUntil: '',
      menuItemIds: [] as string[],
      isActive: true,
    });
  };

  const handleRemoveDeal = (id: string) => {
    setDeals(deals.filter(d => d.id !== id));
  };

  const handleSave = async () => {
    try {
      await vendorService.updateCafeDeals(cafe.id, deals.map(d => ({
        title: d.title,
        description: d.description || undefined,
        discount: d.discount ? (typeof d.discount === 'string' ? parseFloat(d.discount) : d.discount) : undefined,
        menuItemIds: d.menuItemIds || undefined,
        validFrom: d.validFrom,
        validUntil: d.validUntil,
        isActive: d.isActive
      })));
      toast.success('Deals updated successfully');
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Failed to update deals:', error);
      toast.error(error.message || 'Failed to update deals');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Manage Deals - {cafe.name}</h2>

          {/* Add New Deal */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-3 text-gray-900">Add New Deal</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Deal Title"
                value={newDeal.title}
                onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Discount % (optional)"
                value={newDeal.discount}
                onChange={(e) => setNewDeal({ ...newDeal, discount: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
              />
              <input
                type="date"
                placeholder="Valid From"
                value={newDeal.validFrom}
                onChange={(e) => setNewDeal({ ...newDeal, validFrom: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
              />
              <input
                type="date"
                placeholder="Valid Until"
                value={newDeal.validUntil}
                onChange={(e) => setNewDeal({ ...newDeal, validUntil: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
              />
              <textarea
                placeholder="Description (optional)"
                value={newDeal.description}
                onChange={(e) => setNewDeal({ ...newDeal, description: e.target.value })}
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                rows={2}
              />
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Menu Items for This Deal *</label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 bg-white">
                {cafe.menus.filter(m => m.isAvailable).length === 0 ? (
                  <p className="text-sm text-gray-500">No available menu items</p>
                ) : (
                  cafe.menus.filter(m => m.isAvailable).map((menu) => (
                    <label key={menu.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newDeal.menuItemIds.includes(menu.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewDeal({ ...newDeal, menuItemIds: [...newDeal.menuItemIds, menu.id] });
                          } else {
                            setNewDeal({ ...newDeal, menuItemIds: newDeal.menuItemIds.filter((id: string) => id !== menu.id) });
                          }
                        }}
                        className="h-4 w-4 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-900">{menu.name} - PKR {menu.price}</span>
                    </label>
                  ))
                )}
              </div>
              {newDeal.menuItemIds.length === 0 && (
                <p className="text-xs text-red-600 mt-1">Please select at least one menu item</p>
              )}
            </div>
            <button
              onClick={handleAddDeal}
              disabled={newDeal.menuItemIds.length === 0}
              className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Add Deal
            </button>
          </div>

          {/* Deals List */}
          <div className="max-h-96 overflow-y-auto">
            {deals.map((deal) => (
              <div key={deal.id} className="flex items-center justify-between p-3 border-b">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-gray-900">{deal.title}</h4>
                    {deal.discount && (
                      <span className="text-sm font-semibold text-green-600">
                        {deal.discount}% OFF
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(deal.validFrom).toLocaleDateString()} -{' '}
                      {new Date(deal.validUntil).toLocaleDateString()}
                    </span>
                  </div>
                  {deal.description && (
                    <p className="text-sm text-gray-500 mt-1">{deal.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveDeal(deal.id)}
                  className="ml-4 text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cafe Image Upload Component
function CafeImageUpload({
  cafeId,
  currentImageUrl,
  onSuccess
}: {
  cafeId: string;
  currentImageUrl?: string;
  onSuccess: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState<string | undefined>(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${API_URL}/cafes/${cafeId}/image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type - axios will set it automatically with boundary
          },
          timeout: 30000, // 30 second timeout for file uploads
        }
      );

      // Update image URL from response
      const imageUrl = response.data.imageUrl || response.data.cafe?.imageUrl;
      if (imageUrl) {
        setLocalImageUrl(imageUrl);
      }

      toast.success('Cafe image uploaded successfully');
      // Call onSuccess to refresh the cafe data
      onSuccess();
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      {(localImageUrl || currentImageUrl) && (
        <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
          <img
            src={getImageUrl(localImageUrl || currentImageUrl) || ''}
            alt="Cafe"
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error('❌ Image failed to load:', target.src);
              // Hide broken image
              target.style.display = 'none';
            }}
            onLoad={() => {
              // Image loaded successfully
            }}
          />
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        id={`cafe-image-${cafeId}`}
      />
      <label
        htmlFor={`cafe-image-${cafeId}`}
        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
      >
        <PhotoIcon className="h-4 w-4 mr-2" />
        {uploading ? 'Uploading...' : (localImageUrl || currentImageUrl) ? 'Change Image' : 'Upload Image'}
      </label>
    </div>
  );
}

