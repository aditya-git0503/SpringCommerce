import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";
import {
  addGuestCartItem,
  getGuestCart,
  getGuestCartId,
  removeGuestCartItem,
  updateGuestCartItem,
} from "../utils/guestCart.js";

export default function ProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscountCode, setAppliedDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [availability, setAvailability] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");

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

  const addressTextPattern = /^(?=.*[A-Za-z])[A-Za-z0-9 ]+$/;

  function isAddressFieldValid(value) {
    return addressTextPattern.test(value.trim());
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadCartItems();
      return;
    }

    loadGuestCartItems();
    setShowCheckout(false);
  }, [isAuthenticated, products]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (
      !isAuthenticated ||
      loadingCart ||
      params.get("checkout") !== "1"
    ) {
      return;
    }

    if (cartItems.length > 0) {
      setSelectedItems(cartItems.map((item) => item.cartId));
      setShowCheckout(true);
    }
    navigate("/products", { replace: true });
  }, [isAuthenticated, loadingCart, cartItems, location.search, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !showCheckout) {
      return;
    }
    loadAddresses();
  }, [isAuthenticated, showCheckout]);

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      setDiscountCode("");
      setAppliedDiscountCode("");
      setDiscountError("");
      return;
    }

    const storedCode = localStorage.getItem(`discountCode:${user.userId}`);
    setDiscountCode(storedCode || "");
  }, [isAuthenticated, user?.userId]);

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) {
      return;
    }

    const trimmedCode = discountCode.trim();
    const storageKey = `discountCode:${user.userId}`;
    if (trimmedCode === "") {
      localStorage.removeItem(storageKey);
      return;
    }

    localStorage.setItem(storageKey, trimmedCode);
  }, [discountCode, isAuthenticated, user?.userId]);

  useEffect(() => {
    if (selectedItems.length === 0) {
      setAppliedDiscountCode("");
    }
  }, [selectedItems.length]);

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
    if (!isAuthenticated) {
      loadGuestCartItems();
      return;
    }

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

  function loadGuestCartItems() {
    const productById = new Map(
      products.map((product) => [product.productId, product]),
    );
    const items = getGuestCart()
      .map((item) => {
        const product = productById.get(item.productId);
        if (!product) {
          return null;
        }

        return {
          cartId: getGuestCartId(item.productId),
          quantity: Math.min(item.quantity, product.stockAmount),
          productId: item.productId,
          productName: product.productName,
          price: product.price,
          imageUrl: product.imageUrl,
          stockAmount: product.stockAmount,
        };
      })
      .filter(Boolean)
      .filter((item) => item.quantity > 0);

    const currentCartIds = items.map((item) => item.cartId);
    setCartItems(items);
    setSelectedItems((prevSelected) => {
      const stillValidIds = prevSelected.filter((id) =>
        currentCartIds.includes(id),
      );
      const newCartIds = currentCartIds.filter(
        (id) => !prevSelected.includes(id),
      );
      return [...new Set([...stillValidIds, ...newCartIds])];
    });
    setLoadingCart(false);
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
    navigate("/products");
  }

  async function handleAddToCart(productId) {
    try {
      setActionError("");
      const product = products.find((item) => item.productId === productId);
      if (!product) {
        setActionError("Product not found");
        return;
      }

      if (!isAuthenticated) {
        const existingItem = getGuestCart().find(
          (item) => item.productId === productId,
        );
        const nextQuantity = (existingItem?.quantity || 0) + 1;
        if (nextQuantity > product.stockAmount) {
          setActionError("Requested quantity exceeds available stock");
          return;
        }

        addGuestCartItem(productId, 1);
        loadGuestCartItems();
        return;
      }

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

  async function handleUpdateQuantity(cartId, quantity, productId) {
    try {
      setActionError("");
      if (!isAuthenticated) {
        const product = products.find((item) => item.productId === productId);
        if (!product) {
          setActionError("Product not found");
          return;
        }

        if (quantity > product.stockAmount) {
          setActionError("Requested quantity exceeds available stock");
          return;
        }

        updateGuestCartItem(productId, quantity);
        loadGuestCartItems();
        return;
      }

      await api.put("/cart/update", null, {
        params: { cartId, quantity },
      });
      await loadCartItems();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to update quantity"));
    }
  }

  async function handleRemoveFromCart(cartId, productId) {
    try {
      setActionError("");
      if (!isAuthenticated) {
        removeGuestCartItem(productId);
        loadGuestCartItems();
        return;
      }

      await api.delete(`/cart/remove/${cartId}`);
      await loadCartItems();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to remove cart item"));
    }
  }

  function handleCheckoutClick() {
    setActionError("");
    setActionSuccess("");

    if (!isAuthenticated) {
      navigate("/login?redirect=/products&checkout=1");
      return;
    }

    setShowCheckout(true);
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
        discountCode:
          appliedDiscountCode.trim() === "" ? null : appliedDiscountCode.trim(),
      });
      setActionSuccess("Order placed successfully");
      await Promise.all([loadCartItems(), loadProducts()]);
      setShowCheckout(false);
      // clear discount input and applied code after placing order
      setDiscountCode("");
      setAppliedDiscountCode("");
      if (isAuthenticated && user?.userId) {
        localStorage.removeItem(`discountCode:${user.userId}`);
      }
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
    const parsedFrom = Number.parseFloat(priceFrom.trim());
    const parsedTo = Number.parseFloat(priceTo.trim());
    const minPrice =
      priceFrom.trim() === "" || Number.isNaN(parsedFrom) || parsedFrom < 0
        ? null
        : parsedFrom;
    const maxPrice =
      priceTo.trim() === "" || Number.isNaN(parsedTo) || parsedTo < 0
        ? null
        : parsedTo;
    const hasInvalidRange =
      minPrice !== null && maxPrice !== null && minPrice > maxPrice;

    return products.filter((product) => {
      if (hasInvalidRange) {
        return false;
      }

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
      const matchesMinPrice = minPrice === null || product.price >= minPrice;
      const matchesMaxPrice = maxPrice === null || product.price <= maxPrice;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesAvailability &&
        matchesRating &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });
  }, [products, search, category, availability, ratingFilter, priceFrom, priceTo]);

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

  const noSelectionError = "Select at least one cart item to apply a discount.";
  const hasSelectedItems = selectedItems.length > 0;
  const normalizedAppliedCode = appliedDiscountCode.trim();
  const isDiscountValid =
    normalizedAppliedCode !== "" &&
    normalizedAppliedCode.toLowerCase() === "welcome10";
  const discountAmount = isDiscountValid ? selectedTotal * 0.1 : 0;
  const discountedTotal = Math.max(0, selectedTotal - discountAmount);
  const shouldShowDiscountSummary = isDiscountValid && selectedTotal > 0;

  const canPlaceOrder = selectedItems.length > 0 && Boolean(selectedAddressId);

  const isAddressFormValid =
    isAddressFieldValid(addressForm.fullAddress) &&
    isAddressFieldValid(addressForm.city) &&
    isAddressFieldValid(addressForm.state) &&
    /^\d{6}$/.test(addressForm.pincode) &&
    (addressForm.landmark.trim() === "" ||
      isAddressFieldValid(addressForm.landmark));

  function handleScrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearProductFilters() {
    setSearch("");
    setCategory("");
    setSortOrder("");
    setAvailability("");
    setRatingFilter("");
    setPriceFrom("");
    setPriceTo("");
  }

  function handleApplyDiscount() {
    setDiscountError("");

    if (!hasSelectedItems) {
      setDiscountError(noSelectionError);
      return;
    }

    const trimmedCode = discountCode.trim();
    if (trimmedCode === "") {
      setAppliedDiscountCode("");
      setDiscountError("Enter a discount code.");
      return;
    }

    if (trimmedCode.toLowerCase() !== "welcome10") {
      setAppliedDiscountCode("");
      setDiscountError("Invalid discount code.");
      return;
    }

    setAppliedDiscountCode(trimmedCode);
    setDiscountError("");
  }

  function formatAmount(amount) {
    return Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2);
  }

  return (
    <div className="page products-page">
      <header className="top-nav">
        <div>
          <h2>Products</h2>
          <p>{user?.name ? `Welcome, ${user.name}` : "Welcome, guest"}</p>
        </div>
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <button onClick={() => navigate("/orders")} type="button">
                My Orders
              </button>
              <button onClick={handleLogout} type="button">
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => navigate("/login")} type="button">
              Sign In
            </button>
          )}
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

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="From price"
              value={priceFrom}
              onChange={(event) => setPriceFrom(event.target.value)}
            />

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="To price"
              value={priceTo}
              onChange={(event) => setPriceTo(event.target.value)}
            />

            <button type="button" onClick={clearProductFilters}>
              Clear Filters
            </button>
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
                    onClick={() =>
                      handleUpdateQuantity(
                        item.cartId,
                        item.quantity - 1,
                        item.productId,
                      )
                    }
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    disabled={showCheckout}
                    onClick={() =>
                      handleUpdateQuantity(
                        item.cartId,
                        item.quantity + 1,
                        item.productId,
                      )
                    }
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  disabled={showCheckout}
                  onClick={() => handleRemoveFromCart(item.cartId, item.productId)}
                >
                  Remove
                </button>
              </div>
            ))}

          <div className="price-summary">
            {shouldShowDiscountSummary ? (
              <>
                <p className="price-original">
                  Selected total: ₹{formatAmount(selectedTotal)}
                </p>
                <p className="discount-line">
                  - ₹{formatAmount(discountAmount)}
                </p>
                <p className="price-final">
                  Total after discount: ₹{formatAmount(discountedTotal)}
                </p>
              </>
            ) : (
              <p className="price-final">
                Selected total: ₹{formatAmount(selectedTotal)}
              </p>
            )}
          </div>

          {isAuthenticated && (
            <div className="discount-code">
              <label htmlFor="discount-code-input">Discount code</label>
              <div className="discount-row">
                <input
                  id="discount-code-input"
                  type="text"
                  placeholder="Enter discount code"
                  value={discountCode}
                  onChange={(event) => setDiscountCode(event.target.value)}
                  disabled={!hasSelectedItems}
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={!hasSelectedItems}
                >
                  Apply discount
                </button>
              </div>
              {!hasSelectedItems && (
                <p className="discount-error">{noSelectionError}</p>
              )}
              {discountError && hasSelectedItems && (
                <p className="discount-error">{discountError}</p>
              )}
            </div>
          )}

          <div className="cart-action-row">
            <button
              type="button"
              disabled={selectedItems.length === 0}
              onClick={handleCheckoutClick}
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
