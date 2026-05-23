import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";

export default function ProductsPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [availability, setAvailability] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  const [showCheckout, setShowCheckout] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [newAddress, setNewAddress] = useState({
    fullAddress: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCart, setLoadingCart] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCartItems();
  }, []);

  useEffect(() => {
    if (!showCheckout) {
      return;
    }
    loadAddresses();
  }, [showCheckout]);

  useEffect(() => {
    function onScroll() {
      setShowScrollTop(window.scrollY > 320);
    }

    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function loadProducts() {
    try {
      setLoadingProducts(true);
      const response = await api.get("/products");
      setProducts(
        [...response.data].sort((a, b) => a.productId - b.productId),
      );
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Unable to fetch products"));
    } finally {
      setLoadingProducts(false);
    }
  }

  async function loadCartItems() {
    try {
      setLoadingCart(true);
      const response = await api.get("/cart");
      const items = response.data;
      const previousCartIds = cartItems.map((item) => item.cartId);
      const currentCartIds = items.map((item) => item.cartId);
      const newCartIds = currentCartIds.filter(
        (id) => !previousCartIds.includes(id),
      );
      setCartItems(items);
      setSelectedItems((prevSelected) => {
        const stillValidIds = prevSelected.filter((id) =>
          currentCartIds.includes(id),
        );
        return [...new Set([...stillValidIds, ...newCartIds])];
      });
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Unable to fetch cart items"));
    } finally {
      setLoadingCart(false);
    }
  }

  async function loadAddresses() {
    try {
      const response = await api.get("/address");
      setAddresses(response.data);
      if (response.data.length > 0) {
        setSelectedAddressId(String(response.data[0].addressId));
      } else {
        setSelectedAddressId("");
      }
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Unable to fetch addresses"));
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  async function handleAddToCart(productId) {
    try {
      setActionError("");
      await api.post("/cart/add", {
        productId,
        quantity: 1,
      });
      // setActionSuccess("Product added to cart");
      await loadCartItems();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to add to cart"));
    }
  }

  async function handleUpdateQuantity(cartId, quantity) {
    try {
      setActionError("");
      await api.put("/cart/update", null, {
        params: { cartId, quantity },
      });
      await loadCartItems();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to update quantity"));
    }
  }

  async function handleRemoveFromCart(cartId) {
    try {
      setActionError("");
      await api.delete(`/cart/remove/${cartId}`);
      await loadCartItems();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to remove cart item"));
    }
  }

  async function handleAddAddress(event) {
    event.preventDefault();
    setActionError("");
    setActionSuccess("");

    const payload = {
      ...newAddress,
      pincode: Number(newAddress.pincode),
      landmark: newAddress.landmark || null,
    };

    try {
      await api.post("/address/add", payload);
      setActionSuccess("Address saved successfully");
      setNewAddress({
        fullAddress: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
      });
      await loadAddresses();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to save address"));
    }
  }

  async function handlePlaceOrder() {
    setActionError("");
    setActionSuccess("");

    try {
      await api.post("/order/place", {
        addressId: Number(selectedAddressId),
        cartItemIds: selectedItems,
      });
      setActionSuccess("Order placed successfully");
      await Promise.all([loadCartItems(), loadProducts()]);
      setShowCheckout(false);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to place order"));
    }
  }

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category))],
    [products],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.productName
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory = category === "" || product.category === category;

      const matchesAvailability =
        availability === "" ||
        (availability === "inStock" && product.stockAmount > 0) ||
        (availability === "outOfStock" && product.stockAmount === 0);

      const matchesRating =
        ratingFilter === "" || product.avgRating >= Number(ratingFilter);

      return (
        matchesSearch && matchesCategory && matchesAvailability && matchesRating
      );
    });
  }, [products, search, category, availability, ratingFilter]);

  const sortedProducts = useMemo(() => {
    const cloned = [...filteredProducts];
    if (sortOrder === "lowToHigh") {
      return cloned.sort((a, b) => a.price - b.price);
    }
    if (sortOrder === "highToLow") {
      return cloned.sort((a, b) => b.price - a.price);
    }
    return cloned.sort((a, b) => a.productId - b.productId);
  }, [filteredProducts, sortOrder]);

  const selectedTotal = cartItems
    .filter((item) => selectedItems.includes(item.cartId))
    .reduce((total, item) => total + item.price * item.quantity, 0);

  const canPlaceOrder = selectedItems.length > 0 && Boolean(selectedAddressId);

  const isAddressFormValid =
    newAddress.fullAddress.trim() !== "" &&
    newAddress.city.trim() !== "" &&
    newAddress.state.trim() !== "" &&
    /^\d{6}$/.test(newAddress.pincode);

  function handleScrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="page products-page">
      <header className="top-nav">
        <div>
          <h2>Products</h2>
          <p>{user?.name ? `Welcome, ${user.name}` : "Welcome"}</p>
        </div>
        <div className="nav-actions">
          <button onClick={() => navigate("/orders")} type="button">
            My Orders
          </button>
          <button onClick={handleLogout} type="button">
            Logout
          </button>
        </div>
      </header>

      {(actionError || actionSuccess) && (
        <div className="status-box">
          {actionSuccess && <p className="success-text">{actionSuccess}</p>}
          {actionError && <p className="error-text">{actionError}</p>}
        </div>
      )}

      <div className="products-layout">
        <section className="products-section">
          <div className="filters-row">
            <input
              type="text"
              placeholder="Search products"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            >
              <option value="">Default Sort</option>
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
            </select>

            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
            >
              <option value="">All Stock</option>
              <option value="inStock">In Stock</option>
              <option value="outOfStock">Out of Stock</option>
            </select>

            <select
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value)}
            >
              <option value="">All Ratings</option>
              <option value="4">4 & above</option>
              <option value="3">3 & above</option>
              <option value="2">2 & above</option>
            </select>
          </div>

          {loadingProducts && <p>Loading products...</p>}

          {!loadingProducts && sortedProducts.length === 0 && (
            <p>No products found for current filters.</p>
          )}

          <div className="product-list">
            {sortedProducts.map((product) => (
              <article key={product.productId} className="product-card">
                <img src={product.imageUrl} alt={product.productName} />
                <h3>{product.productName}</h3>
                <p>Price: ₹{product.price}</p>
                <p>Stock: {product.stockAmount}</p>
                <p>Rating: {product.avgRating} ({product.totalBuyers})</p>
                <p>{product.description}</p>
                <button
                  type="button"
                  disabled={showCheckout || product.stockAmount === 0}
                  onClick={() => handleAddToCart(product.productId)}
                >
                  Add to Cart
                </button>
              </article>
            ))}
          </div>
        </section>

        <aside className="cart-section">
          <h3>Cart</h3>

          {loadingCart && <p>Loading cart...</p>}

          {!loadingCart && cartItems.length === 0 && <p>Cart is empty.</p>}

          {!loadingCart &&
            cartItems.map((item) => (
              <div key={item.cartId} className="cart-item">
                <div className="cart-item-head">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.cartId)}
                    disabled={showCheckout}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedItems((prev) => [...prev, item.cartId]);
                      } else {
                        setSelectedItems((prev) =>
                          prev.filter((id) => id !== item.cartId),
                        );
                      }
                    }}
                  />
                  <p>{item.productName}</p>
                </div>

                <div className="qty-row">
                  <button
                    type="button"
                    disabled={showCheckout}
                    onClick={() => handleUpdateQuantity(item.cartId, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    disabled={showCheckout}
                    onClick={() => handleUpdateQuantity(item.cartId, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  disabled={showCheckout}
                  onClick={() => handleRemoveFromCart(item.cartId)}
                >
                  Remove
                </button>
              </div>
            ))}

          <p>
            <strong>Selected total: ₹{selectedTotal}</strong>
          </p>

          <div className="cart-action-row">
            <button
              type="button"
              disabled={selectedItems.length === 0}
              onClick={() => {
                setShowCheckout(true);
                setActionError("");
                setActionSuccess("");
              }}
            >
              Checkout
            </button>
            {showCheckout && (
              <button
                type="button"
                onClick={() => {
                  setShowCheckout(false);
                  setActionError("");
                  setActionSuccess("");
                }}
              >
                Edit Cart
              </button>
            )}
          </div>

          {showCheckout && (
            <div className="checkout-box">
              <h4>Select Address</h4>

              {addresses.length === 0 && <p>No saved addresses yet.</p>}

              {addresses.map((address) => (
                <label key={address.addressId} className="address-option">
                  <input
                    type="radio"
                    name="selectedAddress"
                    checked={selectedAddressId === String(address.addressId)}
                    onChange={() => setSelectedAddressId(String(address.addressId))}
                  />
                  <span>
                    {address.fullAddress}, {address.city}, {address.state} -{" "}
                    {address.pincode}
                    {address.landmark ? ` (${address.landmark})` : ""}
                  </span>
                </label>
              ))}

              <h4>Add New Address</h4>
              <form onSubmit={handleAddAddress} className="form compact-form">
                <input
                  type="text"
                  placeholder="Full Address"
                  value={newAddress.fullAddress}
                  onChange={(event) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      fullAddress: event.target.value,
                    }))
                  }
                />
                <input
                  type="text"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(event) =>
                    setNewAddress((prev) => ({ ...prev, city: event.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(event) =>
                    setNewAddress((prev) => ({ ...prev, state: event.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Pincode (6 digits)"
                  value={newAddress.pincode}
                  onChange={(event) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      pincode: event.target.value,
                    }))
                  }
                />
                <input
                  type="text"
                  placeholder="Landmark (optional)"
                  value={newAddress.landmark}
                  onChange={(event) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      landmark: event.target.value,
                    }))
                  }
                />
                <button type="submit" disabled={!isAddressFormValid}>
                  Save Address
                </button>
              </form>

              <button
                type="button"
                disabled={!canPlaceOrder}
                onClick={handlePlaceOrder}
              >
                Place Order (COD)
              </button>
            </div>
          )}
        </aside>
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
