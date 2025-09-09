import React, { useEffect, useState } from "react";


const Cart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const handleQuantityChange = (id, qty) => {
    const updated = cart.map((item) =>
      item.id === id ? { ...item, quantity: qty } : item
    );
    saveCart(updated);
    setCart(updated);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🛒 Your Cart</h2>
      {cart.length === 0 ? (
        <p>No items in your cart.</p>
      ) : (
        <ul>
          {cart.map((item) => (
            <li key={item.id} className="border p-4 mb-3 rounded">
              <h4 className="font-bold">{item.name}</h4>
              <p>${item.price}</p>
              <input
                type="number"
                value={item.quantity}
                min={1}
                onChange={(e) =>
                  handleQuantityChange(item.id, parseInt(e.target.value))
                }
                className="w-16 border ml-3"
              />
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 font-bold">Total: ${total.toFixed(2)}</div>
    </div>
  );
};

export default Cart;
