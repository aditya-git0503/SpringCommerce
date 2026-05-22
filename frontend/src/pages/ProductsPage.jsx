import { useNavigate } from "react-router-dom";
import { use, useEffect } from "react";
import { useState } from "react";
import axios from "axios";

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [availability, setAvailability] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);

  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  useEffect(() => {
    axios.get("http://localhost:8080/products").then((response) => {
      setProducts(response.data);
      fetchCartItems();
    });
  }, []);

  function handleAddToCart(productId) {
    console.log("Added to cart");
    axios
      .post(
        "http://localhost:8080/cart/add",
        {
          productId: productId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      )
      .then(() => {
        fetchCartItems();
      });
  }

  function fetchCartItems() {
    axios
      .get("http://localhost:8080/cart", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then((response) => {
        setCartItems(response.data);
        setSelectedItems(response.data.map((item) => item.cartId));
      });
  }

  function handleUpdateQuantity(cartId, quantity) {
    axios
      .put(
        "http://localhost:8080/cart/update",
        {},
        {
          params: {
            cartId: cartId,
            quantity: quantity,
          },

          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      )

      .then(() => {
        fetchCartItems();
      });
  }

  function handleRemoveFromCart(cartId) {
    axios
      .delete(`http://localhost:8080/cart/remove/${cartId}`, {
        params: {
          cartId: cartId,
        },
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      })
      .then(() => {
        fetchCartItems();
      });
  }

  function handlePlaceOrder() {
    axios
      .post(
        "http://localhost:8080/order/place",

        {
          cartItemIds: selectedItems,

          addressId: 1,
        },

        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        },
      )

      .then(() => {
        alert("Order placed successfully!");

        fetchCartItems();

        setShowCheckout(false);
      })

      .catch((error) => {
        alert(error.response.data);
      });
  }

  const categories = [...new Set(products.map((product) => product.category))];

  const filteredProducts = products.filter((product) => {
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

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === "lowToHigh") {
      return a.price - b.price;
    }

    if (sortOrder === "highToLow") {
      return b.price - a.price;
    }

    return 0;
  });

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const selectedTotal = cartItems
    .filter((item) => selectedItems.includes(item.cartId))
    .reduce((total, item) => total + item.price * item.quantity, 0);

  const isAddressValid =
    addressLine.trim() !== "" && city.trim() !== "" && /^\d{6}$/.test(pincode);

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 3, padding: "20px" }}>
        <h1>Products Page</h1>

        <input
          type="text"
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="">Default</option>
          <option value="lowToHigh">Price: Low to High</option>
          <option value="highToLow">Price: High to Low</option>
        </select>

        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        >
          <option value="">All Products</option>

          <option value="inStock">In Stock</option>

          <option value="outOfStock">Out Of Stock</option>
        </select>

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          <option value="">All Ratings</option>

          <option value="4">4★ & above</option>

          <option value="3">3★ & above</option>

          <option value="2">2★ & above</option>
        </select>

        <button type="submit" onClick={handleLogout}>
          Logout
        </button>

        {sortedProducts.map((product) => (
          <div key={product.productId}>
            <br />

            <img src={product.imageUrl} alt="product image" width="200px" />
            <h2>{product.productName}</h2>

            <p>₹{product.price}</p>

            <p>Items Left : {product.stockAmount}</p>
            <p>Rating: {product.avgRating}</p>

            <p>{product.description}</p>

            <br />

            <button
              disabled={showCheckout}
              onClick={() => handleAddToCart(product.productId)}
            >
              Add to Cart
            </button>

            <br />
          </div>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          borderLeft: "1px solid gray",
          padding: "20px",
        }}
      >
        <h2>Cart</h2>

        {cartItems.map((product) => (
          <div key={product.productId}>
            <input
              type="checkbox"
              checked={selectedItems.includes(product.cartId)}
              disabled={showCheckout}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedItems([...selectedItems, product.cartId]);
                } else {
                  setSelectedItems(
                    selectedItems.filter((id) => id !== product.cartId),
                  );
                }
              }}
            />

            <p>{product.productName}</p>

            <button
              disabled={showCheckout}
              onClick={() =>
                handleUpdateQuantity(product.cartId, product.quantity - 1)
              }
            >
              -
            </button>

            <span> {product.quantity} </span>

            <button
              disabled={showCheckout}
              onClick={() =>
                handleUpdateQuantity(product.cartId, product.quantity + 1)
              }
            >
              +
            </button>

            <br />

            <button
              disabled={showCheckout}
              onClick={() => handleRemoveFromCart(product.cartId)}
            >
              Remove
            </button>
          </div>
        ))}
        <p>
          <strong>Total: ₹{selectedTotal}</strong>
        </p>

        <button
          disabled={selectedItems.length === 0}
          onClick={() => setShowCheckout(true)}
        >
          Checkout
        </button>

        {showCheckout && (
          <div>
            <div>
              <h3>Delivery Address</h3>

              <input
                type="text"
                placeholder="Address Line"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
              />

              <br />

              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <br />

              <input
                type="text"
                placeholder="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
            <button disabled={!isAddressValid} onClick={handlePlaceOrder}>
              Place Order (COD)
            </button>{" "}
          </div>
        )}
      </div>
    </div>
  );
}
