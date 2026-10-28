import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSettings } from './SettingsContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { settings } = useSettings();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('quesm_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('quesm_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('quesm_cart', JSON.stringify(cartItems));
    if (cartItems.length > 0) {
      localStorage.setItem('quesm_cart_last_active', Date.now().toString());
    }
  }, [cartItems]);

  // Save coupon to localStorage
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('quesm_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('quesm_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product, quantity = 1, variant = '') => {
    setCartItems((prevItems) => {
      const effectivePrice = product.discountedPrice && product.discountedPrice > 0
        ? product.discountedPrice
        : product.price;

      // Unique identifier for item + variant combination
      const itemKey = `${product._id}_${variant}`;
      const existingIndex = prevItems.findIndex(item => item.itemKey === itemKey);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            itemKey,
            productId: product._id,
            name: product.name,
            slug: product.slug,
            image: product.images?.[0] || '',
            price: effectivePrice,
            originalPrice: product.price,
            variant,
            quantity,
            stockQuantity: product.stockQuantity
          }
        ];
      }
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (itemKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemKey);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.itemKey === itemKey ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (itemKey) => {
    setCartItems(prev => prev.filter(item => item.itemKey !== itemKey));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setGiftWrap(false);
    setGiftMessage('');
    localStorage.removeItem('quesm_cart');
    localStorage.removeItem('quesm_coupon');
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Free shipping check
  const freeShippingThreshold = settings?.freeShippingThreshold || 799;
  const standardShippingCharge = settings?.shippingCharge || 70;
  const isFreeShipping = subtotal >= freeShippingThreshold || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : standardShippingCharge;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  // Gift wrap fee
  const giftWrapFee = giftWrap ? (settings?.giftWrapCharge || 49) : 0;

  // Coupon discount calculation
  let discount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscountAmount && discount > appliedCoupon.maxDiscountAmount) {
        discount = appliedCoupon.maxDiscountAmount;
      }
    } else {
      discount = appliedCoupon.discountValue;
    }
    discount = Math.min(discount, subtotal);
  }

  const grandTotal = Math.max(0, subtotal + shippingFee + giftWrapFee - discount);

  // Apply Coupon
  const applyCouponCode = async (code) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal: subtotal })
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        setAppliedCoupon(data.coupon);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Invalid coupon code' };
      }
    } catch (err) {
      return { success: false, message: 'Could not validate coupon. Check connection.' };
    }
  };

  const removeCouponCode = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemsCount,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        shippingFee,
        isFreeShipping,
        freeShippingThreshold,
        amountNeededForFreeShipping,
        giftWrap,
        setGiftWrap,
        giftMessage,
        setGiftMessage,
        giftWrapFee,
        appliedCoupon,
        discount,
        grandTotal,
        applyCouponCode,
        removeCouponCode
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
