export const getCart = () => {
  const cart = localStorage.getItem("guest_cart");
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart) => {
  localStorage.setItem("guest_cart", JSON.stringify(cart));
};

export const addToCart = (product) => {
  const cart = getCart();
  const exists = cart.find((item) => item.id === product.id);
  if (exists) {
    const updated = cart.map((item) =>
      item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
    );
    saveCart(updated);
  } else {
    cart.push({ ...product, quantity: 1 });
    saveCart(cart);
  }
};

export const updateCartQuantity = (productId, quantity) => {
  const cart = getCart();
  const updated = cart.map((item) =>
    item.id === productId ? { ...item, quantity } : item
  );
  saveCart(updated);
};

export const removeFromCart = (productId) => {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
};

export const getCartCount = () =>
  getCart().reduce((sum, item) => sum + item.quantity, 0);

export const clearCart = () => localStorage.removeItem("guest_cart");
