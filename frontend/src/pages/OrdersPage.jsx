import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";
import { formatAmount } from "../utils/format.js";
import { useScrollToTop } from "../utils/useScrollToTop.js";

export default function OrdersPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { showScrollTop, handleScrollToTop } = useScrollToTop();
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [expandedBillId, setExpandedBillId] = useState(null);
  const [deliveryForm, setDeliveryForm] = useState({
    fullAddress: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

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


  function formatStatus(status) {
    if (!status) {
      return "";
    }
    return status.replaceAll("_", " ");
  }



  function getOrderSubtotal(order) {
    if (order.originalAmount != null) {
      return order.originalAmount;
    }
    return order.orderItems.reduce(
      (total, item) => total + item.priceAtPurchase * item.quantity,
      0,
    );
  }

  function getOrderDiscount(order) {
    if (order.discountAmount != null) {
      return order.discountAmount;
    }
    const subtotal = getOrderSubtotal(order);
    return Math.max(0, subtotal - order.totalAmountPaid);
  }

  function handlePrintBill(order) {
    const subtotal = getOrderSubtotal(order);
    const discount = getOrderDiscount(order);
    const totalPaid = Math.max(0, subtotal - discount);

    const itemsHtml = order.orderItems
      .map(
        (item) => `
          <tr>
            <td>${item.productName}</td>
            <td>${item.quantity}</td>
            <td>₹${formatAmount(item.priceAtPurchase)}</td>
            <td>₹${formatAmount(item.priceAtPurchase * item.quantity)}</td>
          </tr>
        `,
      )
      .join("");

    const billWindow = window.open("", "_blank", "width=800,height=600");
    if (!billWindow) {
      setRatingMessage("Popup blocked. Allow popups to print the bill.");
      return;
    }

    billWindow.document.write(`
      <html>
        <head>
          <title>Order #${order.orderId} Bill</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { margin-bottom: 6px; }
            .muted { color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f2f2f2; }
            .summary { margin-top: 16px; }
            .summary div { display: flex; justify-content: space-between; margin: 6px 0; }
          </style>
        </head>
        <body>
          <h1>Order #${order.orderId} Bill</h1>
          <p class="muted">Placed on: ${formatOrderDate(order.orderDate)}</p>
          <p>Delivery Address: ${formatDeliveryAddress(order)}</p>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="summary">
            <div><span>Subtotal</span><span>₹${formatAmount(subtotal)}</span></div>
            <div><span>Discount</span><span>- ₹${formatAmount(discount)}</span></div>
            <div><strong>Total Paid</strong><strong>₹${formatAmount(totalPaid)}</strong></div>
          </div>
        </body>
      </html>
    `);
    billWindow.document.close();
    billWindow.focus();
    billWindow.print();
  }

  function formatDeliveryAddress(order) {
    const parts = [];
    if (order.fullAddress) parts.push(order.fullAddress);
    if (order.city) parts.push(order.city);
    if (order.state) parts.push(order.state);
    let text = parts.join(", ");
    if (order.pincode) {
      text += `${text ? " - " : ""}${order.pincode}`;
    }
    if (order.landmark) {
      text += ` (${order.landmark})`;
    }
    return text || "Address unavailable";
  }

  function startAddressEdit(order) {
    setEditingOrderId(order.orderId);
    setDeliveryForm({
      fullAddress: order.fullAddress || "",
      city: order.city || "",
      state: order.state || "",
      pincode: order.pincode ? String(order.pincode) : "",
      landmark: order.landmark || "",
    });
  }

  function cancelAddressEdit() {
    setEditingOrderId(null);
    setDeliveryForm({
      fullAddress: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    });
  }

  async function saveDeliveryAddress(orderId) {
    try {
      await api.put(`/orders/${orderId}/address`, {
        fullAddress: deliveryForm.fullAddress,
        city: deliveryForm.city,
        state: deliveryForm.state,
        pincode: Number(deliveryForm.pincode),
        landmark: deliveryForm.landmark || null,
      });
      setRatingMessage("Delivery address updated successfully");
      cancelAddressEdit();
      await loadOrders();
    } catch (err) {
      setRatingMessage(getApiErrorMessage(err, "Failed to update delivery address"));
    }
  }

  async function handleRatingSubmit(productId, orderItemId) {
  const selectedValue = ratingInputs[orderItemId];

  if (!selectedValue) {
    setRatingMessage("Please select a rating first");
    return;
  }

  try {
    await api.post("/ratings", {
      productId: productId,
      orderItemId: orderItemId,
      rating: Number(selectedValue),
    });

    setRatingMessage("Rating submitted successfully");

    setRatingInputs((prev) => ({
      ...prev,
      [orderItemId]: "",
    }));

    await loadOrders();
  } catch (err) {
    setRatingMessage(getApiErrorMessage(err, "Failed to submit rating"));
  }
}

  const isDeliveryFormValid =
    deliveryForm.fullAddress.trim() !== "" &&
    deliveryForm.city.trim() !== "" &&
    deliveryForm.state.trim() !== "" &&
    /^[0-9]{6}$/.test(deliveryForm.pincode);

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
            <p>Status: {formatStatus(order.status)}</p>
            {order.discountAmount != null && order.discountAmount > 0 ? (
              <p>Discounted amount: ₹{order.totalAmountPaid}</p>
            ) : (
              <p>Amount Paid: ₹{order.totalAmountPaid}</p>
            )}
            <p>Placed On: {formatOrderDate(order.orderDate)}</p>
            <p>Delivery Address: {formatDeliveryAddress(order)}</p>

            <div className="bill-actions">
              <button
                type="button"
                onClick={() =>
                  setExpandedBillId((prev) =>
                    prev === order.orderId ? null : order.orderId,
                  )
                }
              >
                {expandedBillId === order.orderId ? "Hide Bill" : "View Bill"}
              </button>
              <button type="button" onClick={() => handlePrintBill(order)}>
                Print Bill
              </button>
            </div>

            {expandedBillId === order.orderId && (
              <div className="bill-panel">
                <div className="bill-header">
                  <h4>Bill Details</h4>
                  <span>Order #{order.orderId}</span>
                </div>
                <table className="bill-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems.map((item) => (
                      <tr key={item.orderItemId}>
                        <td>{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td>₹{formatAmount(item.priceAtPurchase)}</td>
                        <td>
                          ₹{formatAmount(item.priceAtPurchase * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bill-summary">
                  <div>
                    <span>Subtotal</span>
                    <span>₹{formatAmount(getOrderSubtotal(order))}</span>
                  </div>
                  <div>
                    <span>Discount</span>
                    <span>- ₹{formatAmount(getOrderDiscount(order))}</span>
                  </div>
                  <div className="bill-total">
                    <strong>Total Paid</strong>
                    <strong>₹{formatAmount(order.totalAmountPaid)}</strong>
                  </div>
                </div>
              </div>
            )}

            {order.status === "PLACED" && editingOrderId !== order.orderId && (
              <button type="button" onClick={() => startAddressEdit(order)}>
                Edit Delivery Address
              </button>
            )}

            {editingOrderId === order.orderId && (
              <div className="order-address-edit">
                <input
                  type="text"
                  placeholder="Full Address"
                  value={deliveryForm.fullAddress}
                  onChange={(event) =>
                    setDeliveryForm((prev) => ({
                      ...prev,
                      fullAddress: event.target.value,
                    }))
                  }
                />
                <input
                  type="text"
                  placeholder="City"
                  value={deliveryForm.city}
                  onChange={(event) =>
                    setDeliveryForm((prev) => ({
                      ...prev,
                      city: event.target.value,
                    }))
                  }
                />
                <input
                  type="text"
                  placeholder="State"
                  value={deliveryForm.state}
                  onChange={(event) =>
                    setDeliveryForm((prev) => ({
                      ...prev,
                      state: event.target.value,
                    }))
                  }
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={deliveryForm.pincode}
                  onChange={(event) =>
                    setDeliveryForm((prev) => ({
                      ...prev,
                      pincode: event.target.value,
                    }))
                  }
                />
                <input
                  type="text"
                  placeholder="Landmark (optional)"
                  value={deliveryForm.landmark}
                  onChange={(event) =>
                    setDeliveryForm((prev) => ({
                      ...prev,
                      landmark: event.target.value,
                    }))
                  }
                />
                <div className="order-address-actions">
                  <button
                    type="button"
                    onClick={() => saveDeliveryAddress(order.orderId)}
                    disabled={!isDeliveryFormValid}
                  >
                    Save Address
                  </button>
                  <button type="button" onClick={cancelAddressEdit}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

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
                          value={ratingInputs[item.orderItemId] || ""}
                          onChange={(event) =>
                            setRatingInputs((prev) => ({
                              ...prev,
                              [item.orderItemId]: event.target.value,
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
                        <button type="button" onClick={() => handleRatingSubmit(item.productId, item.orderItemId)}>
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

      {showScrollTop && (
        <button
          type="button"
          className="scroll-top-btn"
          onClick={handleScrollToTop}
          aria-label="Scroll to top"
        >
          ↑ Top
        </button>
      )}
    </div>
  );
}
