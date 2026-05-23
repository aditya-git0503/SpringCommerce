import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";

export default function OrdersPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [ratingInputs, setRatingInputs] = useState({}); 
  const [ratingMessage, setRatingMessage] = useState(""); 

  async function loadOrders() {
    try {
      setLoading(true);
      const response = await api.get("/orders");
      setOrders(response.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to fetch orders"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function formatOrderDate(orderDate) {
    if (!orderDate) {
      return "";
    }

    const [datePart, timePart] = orderDate.split("T");
    if (!datePart || !timePart) {
      return orderDate;
    }

    const [year, month, day] = datePart.split("-");
    const [rawHour, minute] = timePart.split(":");

    const hourNumber = Number(rawHour);
    const displayHour = hourNumber % 12 || 12;
    const meridian = hourNumber >= 12 ? "PM" : "AM";

    return `${month}/${day}/${year}, ${displayHour}:${minute} ${meridian}`;
  }

  async function handleRatingSubmit(productId) {
  const selectedValue = ratingInputs[productId];

  if (!selectedValue) {
    setRatingMessage("Please select a rating first");
    return;
  }

  try {
    await api.post("/ratings", {
      productId: productId,
      rating: Number(selectedValue),
    });

    setRatingMessage("Rating submitted successfully");

    setRatingInputs((prev) => ({
      ...prev,
      [productId]: "",
    }));

    await loadOrders();
  } catch (err) {
    setRatingMessage(getApiErrorMessage(err, "Failed to submit rating"));
  }
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
      {ratingMessage && <p className="notice-text">{ratingMessage}</p>}

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
            <p>Placed On: {formatOrderDate(order.orderDate)}</p>
            <p>Delivery Address: {order.fullAddress}</p>

            <div className="order-items">
              {order.orderItems.map((item) => (
                <div key={item.orderItemId} className="order-item-row">
                  <img src={item.imageUrl} alt={item.productName} />
                  <div>
                    <p>{item.productName}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Unit Price: ₹{item.priceAtPurchase}</p>
                    <p>Item Total: ₹{item.priceAtPurchase * item.quantity}</p>
                    <p>{item.description}</p>
                    {item.userRating ? (
                      <p>Rated: {item.userRating}/5</p>
                    ) : (
                      <div className="rating-actions">
                        <select
                          value={ratingInputs[item.productId] || ""}
                          onChange={(event) =>
                            setRatingInputs((prev) => ({
                              ...prev,
                              [item.productId]: event.target.value,
                            }))
                          }
                        >
                          <option value="">Rate this product</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                        </select>
                        <button type="button" onClick={() => handleRatingSubmit(item.productId)}>
                          Submit Rating
                        </button>
                      </div>
                    )}
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
