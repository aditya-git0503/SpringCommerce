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
  const [addressSearch, setAddressSearch] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const emptyAddressForm = {
    fullAddress: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  };
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [editingAddressId, setEditingAddressId] = useState(null);

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
      if (response.data.length === 0) {
        setSelectedAddressId("");
        return;
      }

      const selectedStillExists = response.data.some(
        (address) => String(address.addressId) === selectedAddressId,
      );

      if (!selectedStillExists) {
        setSelectedAddressId(String(response.data[0].addressId));
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

  async function handleAddressSubmit(event) {
    event.preventDefault();
    setActionError("");
    setActionSuccess("");

    const payload = {
      ...addressForm,
      pincode: Number(addressForm.pincode),
      landmark: addressForm.landmark || null,
    };

    try {
      if (editingAddressId) {
        await api.put(`/address/${editingAddressId}`, payload);
        setActionSuccess("Address updated successfully");
      } else {
        await api.post("/address/add", payload);
        setActionSuccess("Address saved successfully");
      }
      setAddressForm(emptyAddressForm);
      setEditingAddressId(null);
      await loadAddresses();
    } catch (err) {
      setActionError(
        getApiErrorMessage(
          err,
          editingAddressId ? "Failed to update address" : "Failed to save address",
        ),
      );
    }
  }

  function handleEditAddress(address) {
    setEditingAddressId(address.addressId);
    setAddressForm({
      fullAddress: address.fullAddress,
      city: address.city,
      state: address.state,
      pincode: String(address.pincode),
      landmark: address.landmark || "",
    });
  }

  function handleCancelAddressEdit() {
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm);
  }

  async function handleDeleteAddress(addressId) {
    setActionError("");
    setActionSuccess("");

    try {
      await api.delete(`/address/${addressId}`);
      setActionSuccess("Address deleted successfully");
      if (editingAddressId === addressId) {
        handleCancelAddressEdit();
      }
      await loadAddresses();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to delete address"));
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

  const filteredAddresses = useMemo(() => {
    const keyword = addressSearch.trim().toLowerCase();

    if (keyword === "") {
      return addresses;
    }

    return addresses.filter((address) => {
      const combinedAddress = [
        address.fullAddress,
        address.city,
        address.state,
        address.pincode,
        address.landmark || "",
      ]
        .join(" ")
        .toLowerCase();

      return combinedAddress.includes(keyword);
    });
  }, [addresses, addressSearch]);

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
    addressForm.fullAddress.trim() !== "" &&
    addressForm.city.trim() !== "" &&
    addressForm.state.trim() !== "" &&
    /^\d{6}$/.test(addressForm.pincode);

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
                <p>{product.description}</p>
                <p>Price: ₹{product.price}</p>
                <p>Rating: {product.avgRating} ({product.totalBuyers})</p>
                <p>Stock: {product.stockAmount}</p>
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

              {addresses.length > 0 && (
                <>
                  <input
                    type="text"
                    className="address-search"
                    placeholder="Search saved addresses"
                    value={addressSearch}
                    onChange={(event) => setAddressSearch(event.target.value)}
                  />

                  {filteredAddresses.length === 0 && (
                    <p>No addresses match your search.</p>
                  )}

                  <div className="address-list-scroll">
                    {filteredAddresses.map((address) => (
                      <div key={address.addressId} className="address-card">
                        <label className="address-option">
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
                        <div className="address-actions">
                          <button
                            type="button"
                            onClick={() => handleEditAddress(address)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(address.addressId)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <h4>{editingAddressId ? "Edit Address" : "Add New Address"}</h4>
              <form onSubmit={handleAddressSubmit} className="form compact-form">
                <input
                  type="text"
                  placeholder="Full Address"
                  value={addressForm.fullAddress}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      fullAddress: event.target.value,
                    }))
                  }
                />
                <input
                  type="text"
                  placeholder="City"
                  value={addressForm.city}
                  onChange={(event) =>
                    setAddressForm((prev) => ({ ...prev, city: event.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="State"
                  value={addressForm.state}
                  onChange={(event) =>
                    setAddressForm((prev) => ({ ...prev, state: event.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Pincode (6 digits)"
                  value={addressForm.pincode}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      pincode: event.target.value,
                    }))
                  }
                />
                <input
                  type="text"
                  placeholder="Landmark (optional)"
                  value={addressForm.landmark}
                  onChange={(event) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      landmark: event.target.value,
                    }))
                  }
                />
                <div className="address-form-actions">
                  <button type="submit" disabled={!isAddressFormValid}>
                    {editingAddressId ? "Update Address" : "Save Address"}
                  </button>
                  {editingAddressId && (
                    <button
                      type="button"
                      onClick={handleCancelAddressEdit}
                    >
                      Cancel
                    </button>
                  )}
                </div>
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
