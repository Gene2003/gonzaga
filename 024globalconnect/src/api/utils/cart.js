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
  if (!exists) {
    cart.push({ ...product, quantity: 1 });
    saveCart(cart);
  }
};

export const clearCart = () => localStorage.removeItem("guest_cart");
