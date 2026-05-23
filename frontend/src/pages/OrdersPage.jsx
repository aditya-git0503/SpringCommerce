import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function OrdersPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const response = await api.get("/orders");
        setOrders(response.data);
      } catch (err) {
        setError(err.response?.data || "Unable to fetch orders");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="page orders-page">
      <header className="top-nav">
        <h2>My Orders</h2>
        <div className="nav-actions">
          <button type="button" onClick={() => navigate("/products")}>
            Products
          </button>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {loading && <p>Loading orders...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p>No orders yet. Place one from the products page.</p>
      )}

      <div className="orders-list">
        {orders.map((order) => (
          <article key={order.orderId} className="order-card">
            <h3>Order #{order.orderId}</h3>
            <p>Status: {order.status}</p>
            <p>Amount Paid: ₹{order.totalAmountPaid}</p>
            <p>Placed On: {new Date(order.orderDate).toLocaleString()}</p>
            <p>Delivery Address: {order.fullAddress}</p>

            <div className="order-items">
              {order.orderItems.map((item) => (
                <div key={item.orderItemId} className="order-item-row">
                  <img src={item.imageUrl} alt={item.productName} />
                  <div>
                    <p>{item.productName}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ₹{item.priceAtPurchase}</p>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
