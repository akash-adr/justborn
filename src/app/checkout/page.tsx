'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';
import { CustomerAddress } from '@/lib/types';
import {
  getAddressesAction,
  addAddressAction,
  updateAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from '@/app/actions/address';
import confetti from 'canvas-confetti';
import { processCheckoutAction, verifyPaymentAction, markPaymentFailedAction } from '@/app/actions/checkout';
import { loadScript } from '@/lib/utils';
import { CouponBox } from '@/components/cart/CouponBox';

import {
  ShieldCheck,
  Truck,
  Gift,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Lock,
  Plus,
  MapPin,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Tag,
  X,
  ChevronDown,
  Building,
  User,
  Phone,
  Mail,
  Package,
} from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
];

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    shippingFee,
    appliedPromo,
    discountAmount,
    finalTotal,
    applyPromoCode,
    removePromoCode,
    clearCart,
  } = useCart();
  const { user, profile, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Authentication Guard: Guests must log in before accessing checkout
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/checkout');
    }
  }, [authLoading, user, router]);

  // Screen State
  const [loading, setLoading] = useState(false);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);

  // Address Modal Form State
  const [modalFullName, setModalFullName] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalAddressLine1, setModalAddressLine1] = useState('');
  const [modalAddressLine2, setModalAddressLine2] = useState('');
  const [modalCity, setModalCity] = useState('');
  const [modalState, setModalState] = useState('Maharashtra');
  const [modalPostalCode, setModalPostalCode] = useState('');
  const [modalIsDefault, setModalIsDefault] = useState(false);
  const [modalErrors, setModalErrors] = useState<FormErrors>({});

  // Checkout Main Form Fields (Active Shipping Address)
  const [contactEmail, setContactEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [postalCode, setPostalCode] = useState('');
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);
  const [orderNotes, setOrderNotes] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  // Delivery Method: 'standard' | 'express'
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');
  const expressSurcharge = deliveryMethod === 'express' ? 149 : 0;

  // Payment Method: 'razorpay' | 'cod'
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

  // Coupon input
  const [couponInput, setCouponInput] = useState('');

  const applySelectedAddress = (addr: CustomerAddress) => {
    setSelectedAddressId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
  };

  // 1. Pre-fill user data & fetch saved addresses
  useEffect(() => {
    if (user) {
      setContactEmail(user.email || '');
      if (profile?.fullName) setFullName(profile.fullName);
      if (profile?.phone) setPhone(profile.phone);

      // Fetch saved addresses from Supabase
      startTransition(async () => {
        const res = await getAddressesAction();
        if (res.success && res.data && res.data.length > 0) {
          setSavedAddresses(res.data);
          const defaultAddr = res.data.find((a) => a.isDefault) || res.data[0];
          applySelectedAddress(defaultAddr);
        }
      });
    }
  }, [user, profile]);

  // Validation function
  const validateFields = (fields: {
    fullName: string;
    email?: string;
    phone: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
  }): { isValid: boolean; fieldErrors: FormErrors } => {
    const errs: FormErrors = {};

    if (!fields.fullName.trim() || fields.fullName.trim().length < 2) {
      errs.fullName = 'Please enter your full name (at least 2 characters).';
    }

    if (fields.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!fields.email.trim() || !emailRegex.test(fields.email.trim())) {
        errs.email = 'Please provide a valid email address for order confirmation.';
      }
    }

    const cleanPhone = fields.phone.replace(/\D/g, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
      errs.phone = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
    }

    if (!fields.addressLine1.trim() || fields.addressLine1.trim().length < 5) {
      errs.addressLine1 = 'Please specify your house/flat number and street (min 5 chars).';
    }

    if (!fields.city.trim() || fields.city.trim().length < 2) {
      errs.city = 'Please enter your city.';
    }

    if (!fields.state.trim()) {
      errs.state = 'Please select your state.';
    }

    const pinRegex = /^[1-9][0-9]{5}$/;
    const cleanPin = fields.postalCode.replace(/\s/g, '');
    if (!cleanPin || !pinRegex.test(cleanPin)) {
      errs.postalCode = 'Please enter a valid 6-digit Indian PIN code (e.g. 400050).';
    }

    return {
      isValid: Object.keys(errs).length === 0,
      fieldErrors: errs,
    };
  };

  // Handle saving new / edited address in modal
  const handleSaveModalAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateFields({
      fullName: modalFullName,
      phone: modalPhone,
      addressLine1: modalAddressLine1,
      city: modalCity,
      state: modalState,
      postalCode: modalPostalCode,
    });

    if (!validation.isValid) {
      setModalErrors(validation.fieldErrors);
      return;
    }

    setModalErrors({});
    setLoading(true);

    try {
      if (editingAddress) {
        // Update existing address
        const res = await updateAddressAction(editingAddress.id, {
          fullName: modalFullName,
          phone: modalPhone,
          addressLine1: modalAddressLine1,
          addressLine2: modalAddressLine2,
          city: modalCity,
          state: modalState,
          postalCode: modalPostalCode,
          isDefault: modalIsDefault,
        });

        if (res.success && res.data) {
          showToast({ type: 'success', title: 'Address Updated', message: 'Your shipping address was saved.' });
          const refreshed = await getAddressesAction();
          if (refreshed.data) {
            setSavedAddresses(refreshed.data);
            applySelectedAddress(res.data);
          }
          setIsAddressModalOpen(false);
        } else {
          showToast({ type: 'error', title: 'Error', message: res.message || 'Failed to update address.' });
        }
      } else {
        // Add new address
        const res = await addAddressAction({
          fullName: modalFullName,
          phone: modalPhone,
          addressLine1: modalAddressLine1,
          addressLine2: modalAddressLine2,
          city: modalCity,
          state: modalState,
          postalCode: modalPostalCode,
          isDefault: modalIsDefault || savedAddresses.length === 0,
        });

        if (res.success && res.data) {
          showToast({ type: 'success', title: 'Address Saved', message: 'New address added to your address book.' });
          const refreshed = await getAddressesAction();
          if (refreshed.data) {
            setSavedAddresses(refreshed.data);
            applySelectedAddress(res.data);
          }
          setIsAddressModalOpen(false);
        } else {
          showToast({ type: 'error', title: 'Error', message: res.message || 'Failed to save address.' });
        }
      }
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message || 'Failed to save address.' });
    } finally {
      setLoading(false);
    }
  };

  // Open modal for editing
  const openEditModal = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    setModalFullName(addr.fullName);
    setModalPhone(addr.phone);
    setModalAddressLine1(addr.addressLine1);
    setModalAddressLine2(addr.addressLine2 || '');
    setModalCity(addr.city);
    setModalState(addr.state);
    setModalPostalCode(addr.postalCode);
    setModalIsDefault(addr.isDefault);
    setModalErrors({});
    setIsAddressModalOpen(true);
  };

  // Open modal for adding new
  const openNewAddressModal = () => {
    setEditingAddress(null);
    setModalFullName(fullName || profile?.fullName || '');
    setModalPhone(phone || profile?.phone || '');
    setModalAddressLine1('');
    setModalAddressLine2('');
    setModalCity(city || '');
    setModalState(state || 'Maharashtra');
    setModalPostalCode('');
    setModalIsDefault(savedAddresses.length === 0);
    setModalErrors({});
    setIsAddressModalOpen(true);
  };

  // Delete address
  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to remove this address?')) return;
    const res = await deleteAddressAction(id);
    if (res.success) {
      showToast({ type: 'info', title: 'Address Removed', message: 'Address removed from your account.' });
      const refreshed = await getAddressesAction();
      if (refreshed.data) {
        setSavedAddresses(refreshed.data);
        if (selectedAddressId === id) {
          if (refreshed.data.length > 0) {
            applySelectedAddress(refreshed.data[0]);
          } else {
            setSelectedAddressId(null);
          }
        }
      }
    }
  };

  // Set default address
  const handleSetDefaultAddress = async (id: string) => {
    const res = await setDefaultAddressAction(id);
    if (res.success) {
      showToast({ type: 'success', title: 'Default Updated', message: 'Default shipping address updated.' });
      const refreshed = await getAddressesAction();
      if (refreshed.data) {
        setSavedAddresses(refreshed.data);
      }
    }
  };

  // Handle promo code apply
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    await applyPromoCode(couponInput);
    setCouponInput('');
  };

  // Handle order submission / Razorpay trigger
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation
    const validation = validateFields({
      fullName,
      email: contactEmail,
      phone,
      addressLine1,
      city,
      state,
      postalCode,
    });

    if (!validation.isValid) {
      setErrors(validation.fieldErrors);
      showToast({
        type: 'error',
        title: 'Missing Required Fields',
        message: 'Please review and fix the highlighted shipping information.',
      });
      // Scroll to first error
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      let finalAddressId = selectedAddressId;

      // If user wants to save address (or it's their first time) and is logged in and not already selected
      if (user && !selectedAddressId) {
        const newAddr = await addAddressAction({
          fullName,
          phone,
          addressLine1,
          addressLine2,
          city,
          state,
          postalCode,
          isDefault: savedAddresses.length === 0,
        });

        if (!newAddr.success || !newAddr.data?.id) {
          throw new Error(newAddr.message || 'Failed to save address.');
        }
        finalAddressId = newAddr.data.id;
      }

      if (!finalAddressId) {
         throw new Error('Please sign in or provide a valid address to continue.');
      }

      // Initialize Server-side Checkout
      const checkoutRes = await processCheckoutAction(finalAddressId, appliedPromo?.code || undefined);
      
      if (!checkoutRes.success || !checkoutRes.data) {
        throw new Error(checkoutRes.message || 'Failed to initialize checkout session.');
      }

      // Load Razorpay Script
      const isLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your connection.');
      }

      const { orderId, orderNumber, rzpOrderId, amount, currency } = checkoutRes.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use public key only
        amount: Math.round(amount * 100),
        currency: currency,
        name: 'Just Born',
        description: 'Premium Heirloom Toys',
        image: '/favicon.ico',
        order_id: rzpOrderId,
        handler: async function (response: any) {
          try {
            setLoading(true); // Re-enable loading state while verifying
            
            const verifyRes = await verifyPaymentAction(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (!verifyRes.success) {
              throw new Error(verifyRes.message || 'Payment verification failed.');
            }

            clearCart(); // Clear local context cart safely AFTER success
            router.push(`/order-success/${orderId}`);
          } catch (err: any) {
            showToast({
              type: 'error',
              title: 'Verification Failed',
              message: err.message || 'Payment was captured but verification failed. Support has been notified.',
            });
            setLoading(false);
          }
        },
        prefill: {
          name: fullName,
          email: contactEmail,
          contact: phone,
        },
        theme: {
          color: '#E63946',
        },
        modal: {
          ondismiss: function () {
            markPaymentFailedAction(rzpOrderId).catch(() => {});
            showToast({
              type: 'error',
              title: 'Payment Cancelled',
              message: 'You cancelled the payment. Please try again when ready.',
            });
            setLoading(false);
          },
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      
      paymentObject.on('payment.failed', function (response: any) {
        markPaymentFailedAction(rzpOrderId).catch(() => {});
        showToast({
          type: 'error',
          title: 'Payment Failed',
          message: response.error?.description || 'Your payment failed. Please try again.',
        });
        setLoading(false);
      });
      
      paymentObject.open();

    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Order Processing Error',
        message: err.message || 'Failed to place order. Please try again.',
      });
      setLoading(false);
    }
  };

  // Calculated totals
  const totalShipping = shippingFee + expressSurcharge;
  const grandTotal = Math.max(0, subtotal - discountAmount + totalShipping);

  // Estimated GST (18% included in product prices per Indian law)
  const estimatedTax = Math.round((subtotal * 18) / 118);

  // If authentication is still resolving or user is not logged in, show secure transition
  if (authLoading || !user) {
    return (
      <div className="min-h-screen py-16 bg-[#faf9f6] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#D9232E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-stone-500">Securing checkout session...</p>
        </div>
      </div>
    );
  }

  // If cart is empty, prompt user to add items
  if (items.length === 0) {
    return (
      <div className="min-h-screen py-16 bg-[#faf9f6] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#E63946] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900">Your Basket is Empty</h2>
          <p className="text-xs text-stone-500">
            Please add heirloom toys to your basket before proceeding to checkout.
          </p>
          <Link href="/shop">
            <Button variant="primary">Browse Playroom Toys</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-[#faf9f6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 mb-2">
            <Link href="/" className="hover:text-stone-700 transition">
              Home
            </Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-stone-700 transition">
              Basket
            </Link>
            <span>/</span>
            <span className="text-stone-900 font-bold">Secure Checkout</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-stone-900 tracking-tight flex items-center gap-3">
            <span>Nursery Checkout</span>
            <span className="text-xs font-sans font-bold px-3 py-1 rounded-full bg-red-50 text-[#E63946] border border-red-200 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> 256-bit Encrypted
            </span>
          </h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Sections (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Contact Information Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-red-50 text-[#E63946] font-bold text-sm flex items-center justify-center">
                    1
                  </div>
                  <h2 className="text-lg font-bold text-stone-900">Contact Information</h2>
                </div>
                {!user && (
                  <Link href="/login?redirect=/checkout" className="text-xs font-bold text-[#E63946] hover:underline">
                    Already have an account? Sign In
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="parent@example.com"
                    error={errors.email}
                    leftIcon={<Mail className="w-4 h-4 text-stone-400" />}
                  />
                  <p className="text-[11px] text-stone-400 mt-1">For digital invoice & dispatch tracking.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      error={errors.phone}
                      leftIcon={<Phone className="w-4 h-4 text-stone-400" />}
                    />
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1">For delivery driver coordination & OTP.</p>
                </div>
              </div>
            </div>

            {/* 2 & 3. Shipping Address & Saved Addresses */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-red-50 text-[#E63946] font-bold text-sm flex items-center justify-center">
                    2
                  </div>
                  <h2 className="text-lg font-bold text-stone-900">Shipping Address</h2>
                </div>

                {user && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={openNewAddressModal}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add New Address
                  </Button>
                )}
              </div>

              {/* Saved Addresses Section (For Authenticated Users) */}
              {user && savedAddresses.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider">
                    Select from Saved Addresses ({savedAddresses.length})
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;

                      return (
                        <div
                          key={addr.id}
                          onClick={() => applySelectedAddress(addr)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#E63946] bg-red-50/30 ring-2 ring-red-100 shadow-xs'
                              : 'border-stone-200/80 bg-white hover:border-red-200 hover:bg-stone-50/50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-bold text-stone-900 text-sm">{addr.fullName}</span>
                              <div className="flex items-center gap-1">
                                {addr.isDefault && (
                                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-900 text-white">
                                    Default
                                  </span>
                                )}
                                {isSelected && (
                                  <span className="w-5 h-5 rounded-full bg-[#E63946] text-white flex items-center justify-center">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-stone-600 line-clamp-2 mt-0.5">
                              {addr.addressLine1}
                              {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                            </p>
                            <p className="text-xs text-stone-600 font-medium">
                              {addr.city}, {addr.state} - {addr.postalCode}
                            </p>
                            <p className="text-[11px] text-stone-400 mt-1">📞 {addr.phone}</p>
                          </div>

                          {/* Action Buttons for this saved address */}
                          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-stone-100 text-xs">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(addr);
                              }}
                              className="text-stone-500 hover:text-stone-900 flex items-center gap-1 font-semibold"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <span className="text-stone-300">•</span>
                            {!addr.isDefault && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetDefaultAddress(addr.id);
                                  }}
                                  className="text-stone-500 hover:text-stone-900 font-semibold"
                                >
                                  Make Default
                                </button>
                                <span className="text-stone-300">•</span>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(addr.id);
                              }}
                              className="text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold ml-auto"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active Delivery Address Form */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  {selectedAddressId ? 'Selected Delivery Details' : 'Enter Shipping Details'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Recipient Full Name <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setSelectedAddressId(null);
                      }}
                      placeholder="e.g. Radhika Sen"
                      error={errors.fullName}
                      leftIcon={<User className="w-4 h-4 text-stone-400" />}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Delivery Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setSelectedAddressId(null);
                      }}
                      placeholder="10-digit number"
                      error={errors.phone}
                      leftIcon={<Phone className="w-4 h-4 text-stone-400" />}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Address Line 1 (House, Flat, Street) <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={addressLine1}
                      onChange={(e) => {
                        setAddressLine1(e.target.value);
                        setSelectedAddressId(null);
                      }}
                      placeholder="e.g. Apartment 402, Lotus Residency, 12th Main Road"
                      error={errors.addressLine1}
                      leftIcon={<MapPin className="w-4 h-4 text-stone-400" />}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Address Line 2 (Apartment, Suite, Landmark - Optional)
                    </label>
                    <Input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => {
                        setAddressLine2(e.target.value);
                        setSelectedAddressId(null);
                      }}
                      placeholder="e.g. Near St. Mary Nursery School"
                      leftIcon={<Building className="w-4 h-4 text-stone-400" />}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setSelectedAddressId(null);
                      }}
                      placeholder="e.g. Mumbai, Bengaluru, Delhi"
                      error={errors.city}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      State / Union Territory <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                        setSelectedAddressId(null);
                      }}
                      className="w-full text-xs font-semibold rounded-2xl bg-stone-50 border border-stone-200 px-3.5 py-3 text-stone-800 focus:outline-none focus:border-[#E63946]"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      PIN Code (6 digits) <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="text"
                      maxLength={6}
                      value={postalCode}
                      onChange={(e) => {
                        setPostalCode(e.target.value);
                        setSelectedAddressId(null);
                      }}
                      placeholder="e.g. 400050"
                      error={errors.postalCode}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Country
                    </label>
                    <div className="w-full text-xs font-semibold rounded-2xl bg-stone-100 border border-stone-200 px-3.5 py-3 text-stone-500 cursor-not-allowed">
                      India (🇮🇳)
                    </div>
                  </div>
                </div>

                {user && !selectedAddressId && (
                  <label className="flex items-center gap-2 pt-2 text-xs font-semibold text-stone-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={saveAddressForFuture}
                      onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                      className="rounded text-[#E63946] focus:ring-[#E63946]/30 w-4 h-4 accent-[#E63946]"
                    />
                    <span>Save this address to my account for future playroom orders</span>
                  </label>
                )}
              </div>
            </div>

            {/* 4. Delivery Information Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
                <div className="w-8 h-8 rounded-full bg-red-50 text-[#E63946] font-bold text-sm flex items-center justify-center">
                  3
                </div>
                <h2 className="text-lg font-bold text-stone-900">Delivery Information & Options</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Standard Shipping */}
                <div
                  onClick={() => setDeliveryMethod('standard')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    deliveryMethod === 'standard'
                      ? 'border-[#E63946] bg-red-50/20 ring-2 ring-red-100'
                      : 'border-stone-200/80 hover:bg-stone-50'
                  }`}
                >
                  <div className="mt-0.5">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === 'standard'}
                      onChange={() => setDeliveryMethod('standard')}
                      className="accent-[#E63946] w-4 h-4"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm">Standard Nursery Delivery</span>
                      <span className="font-bold text-stone-900 text-xs">
                        {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Estimated 2–4 business days via insured express courier.
                    </p>
                  </div>
                </div>

                {/* Priority Express White Glove */}
                <div
                  onClick={() => setDeliveryMethod('express')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    deliveryMethod === 'express'
                      ? 'border-[#E63946] bg-red-50/20 ring-2 ring-red-100'
                      : 'border-stone-200/80 hover:bg-stone-50'
                  }`}
                >
                  <div className="mt-0.5">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === 'express'}
                      onChange={() => setDeliveryMethod('express')}
                      className="accent-[#E63946] w-4 h-4"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm flex items-center gap-1">
                        <span>Priority White Glove</span>
                        <Sparkles className="w-3 h-3 text-[#E63946]" />
                      </span>
                      <span className="font-bold text-[#E63946] text-xs">
                        {formatPrice(shippingFee + 149)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      1–2 days rush delivery with complimentary red ribbon gift wrap.
                    </p>
                  </div>
                </div>
              </div>

              {/* Gift Note / Delivery Instruction */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-[#E63946]" />
                  <span>Complimentary Gift Message / Nursery Instructions (Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Happy 2nd Birthday Ayaan! Love, Masi & Fufa ji."
                  className="w-full text-xs rounded-2xl bg-stone-50 border border-stone-200 p-3 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#E63946]"
                />
              </div>
            </div>

            {/* 7. Payment Section Prepared for Razorpay */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-red-50 text-[#E63946] font-bold text-sm flex items-center justify-center">
                    4
                  </div>
                  <h2 className="text-lg font-bold text-stone-900">Payment Method</h2>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Verified
                </div>
              </div>

              <div className="space-y-3">
                {/* Razorpay Gateway Option */}
                <div
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    paymentMethod === 'razorpay'
                      ? 'border-[#E63946] bg-red-50/20 ring-2 ring-red-100 shadow-xs'
                      : 'border-stone-200/80 hover:bg-stone-50'
                  }`}
                >
                  <div className="mt-0.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="accent-[#E63946] w-4 h-4"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm">
                        Razorpay Secure Checkout (UPI, Cards, NetBanking)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-[#E63946]">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Pay instantly with Google Pay, PhonePe, Paytm, All Credit/Debit Cards, or NetBanking.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500 font-medium">
                      <span>UPI</span> • <span>Visa</span> • <span>Mastercard</span> • <span>RuPay</span> • <span>HDFC / ICICI / SBI</span>
                    </div>
                  </div>
                </div>

                {/* Cash on Delivery Option */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    paymentMethod === 'cod'
                      ? 'border-[#E63946] bg-red-50/20 ring-2 ring-red-100 shadow-xs'
                      : 'border-stone-200/80 hover:bg-stone-50'
                  }`}
                >
                  <div className="mt-0.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-[#E63946] w-4 h-4"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm">Cash on Delivery (COD)</span>
                      <span className="text-xs text-stone-500 font-semibold">Pay at Doorstep</span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      Pay cash or scan QR code when your heirloom package arrives at your home.
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Badges */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/60 flex items-center justify-between text-stone-500 text-xs">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>PCI-DSS Level 1 Compliant • Sensitive secrets never exposed</span>
                </div>
                <span className="font-semibold text-stone-700 hidden sm:inline">100% Safe Payments</span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary, Coupon & Submit Button (4 Cols) */}
          <div className="lg:col-span-4 space-y-6 sticky top-28">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-6">
              <h2 className="text-xl font-bold text-stone-900 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-semibold text-stone-400">({items.length} items)</span>
              </h2>

              {/* Item Previews */}
              <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1 divide-y divide-stone-100">
                {items.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200/60 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate">{item.product.name}</h4>
                      <p className="text-[11px] text-stone-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-extrabold text-stone-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* 6. Coupon Code Section */}
              <div className="pt-2 border-t border-stone-100">
                <CouponBox
                  subtotal={subtotal}
                  appliedCoupon={
                    appliedPromo
                      ? {
                          code: appliedPromo.code,
                          type: appliedPromo.type,
                          value: appliedPromo.value,
                          discountAmount,
                          description: appliedPromo.description,
                        }
                      : null
                  }
                  onApply={(coupon) => {
                    applyPromoCode(coupon.code)
                  }}
                  onRemove={removePromoCode}
                />
              </div>

              {/* Breakdown */}
              <div className="space-y-2.5 pt-3 border-t border-stone-100 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-stone-900">{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-stone-900">
                    {totalShipping === 0 ? <strong className="text-emerald-600">FREE</strong> : formatPrice(totalShipping)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>GST / Tax (Included)</span>
                  <span className="font-medium text-stone-600">{formatPrice(estimatedTax)}</span>
                </div>
              </div>

              {/* Total Due */}
              <div className="pt-4 border-t border-stone-100 flex items-baseline justify-between">
                <div>
                  <span className="text-base font-bold text-stone-900 block">Total Due</span>
                  <span className="text-[11px] text-stone-400">All Indian taxes included</span>
                </div>
                <span className="text-2xl font-black text-stone-900">
                  {formatPrice(grandTotal)}
                </span>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full shadow-lg shadow-red-500/20"
                leftIcon={paymentMethod === 'razorpay' ? <Lock className="w-4 h-4" /> : <Package className="w-4 h-4" />}
              >
                {loading
                  ? 'Processing Order...'
                  : paymentMethod === 'razorpay'
                  ? `Pay ${formatPrice(grandTotal)} via Razorpay`
                  : `Confirm Order • ${formatPrice(grandTotal)}`}
              </Button>

              {/* Assurance Guarantee */}
              <div className="pt-2 text-center space-y-1">
                <p className="text-[11px] text-stone-400 font-medium">
                  🔒 Bank-grade SSL encryption • 100-Day Playroom Guarantee
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Address Modal (Add / Edit) */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title={editingAddress ? 'Edit Shipping Address' : 'Add New Shipping Address'}
        description="Save your address for swift and smooth nursery deliveries."
      >
        <form onSubmit={handleSaveModalAddress} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                value={modalFullName}
                onChange={(e) => setModalFullName(e.target.value)}
                placeholder="e.g. Radhika Sen"
                error={modalErrors.fullName}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <Input
                type="tel"
                value={modalPhone}
                onChange={(e) => setModalPhone(e.target.value)}
                placeholder="10-digit number"
                error={modalErrors.phone}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Street Address <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                value={modalAddressLine1}
                onChange={(e) => setModalAddressLine1(e.target.value)}
                placeholder="Flat / House no, Building name, Street"
                error={modalErrors.addressLine1}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Apartment, Landmark (Optional)
              </label>
              <Input
                type="text"
                value={modalAddressLine2}
                onChange={(e) => setModalAddressLine2(e.target.value)}
                placeholder="Landmark or locality"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                City <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                value={modalCity}
                onChange={(e) => setModalCity(e.target.value)}
                placeholder="e.g. Mumbai"
                error={modalErrors.city}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                State <span className="text-rose-500">*</span>
              </label>
              <select
                value={modalState}
                onChange={(e) => setModalState(e.target.value)}
                className="w-full text-xs font-semibold rounded-2xl bg-stone-50 border border-stone-200 px-3.5 py-3 text-stone-800 focus:outline-none focus:border-[#E63946]"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                PIN Code <span className="text-rose-500">*</span>
              </label>
              <Input
                type="text"
                maxLength={6}
                value={modalPostalCode}
                onChange={(e) => setModalPostalCode(e.target.value)}
                placeholder="6-digit PIN"
                error={modalErrors.postalCode}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Country</label>
              <div className="w-full text-xs font-semibold rounded-2xl bg-stone-100 border border-stone-200 px-3.5 py-3 text-stone-500">
                India
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 pt-2 text-xs font-semibold text-stone-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={modalIsDefault}
              onChange={(e) => setModalIsDefault(e.target.checked)}
              className="rounded text-[#E63946] focus:ring-[#E63946]/30 w-4 h-4 accent-[#E63946]"
            />
            <span>Set as my default shipping address</span>
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddressModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
