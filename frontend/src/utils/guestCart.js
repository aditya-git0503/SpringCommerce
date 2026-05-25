const GUEST_CART_KEY = "guestCart";

function normalizeCartItems(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
    }))
    .filter(
      (item) =>
        Number.isInteger(item.productId) &&
        item.productId > 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    );
}

export function getGuestCart() {
  try {
    return normalizeCartItems(JSON.parse(localStorage.getItem(GUEST_CART_KEY)));
  } catch {
    return [];
  }
}

export function setGuestCart(items) {
  const normalizedItems = normalizeCartItems(items);
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(normalizedItems));
  return normalizedItems;
}

export function clearGuestCart() {
  localStorage.removeItem(GUEST_CART_KEY);
}

export function addGuestCartItem(productId, quantity = 1) {
  const cart = getGuestCart();
  const existingItem = cart.find((item) => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
    return setGuestCart(cart);
  }

  return setGuestCart([...cart, { productId, quantity }]);
}

export function updateGuestCartItem(productId, quantity) {
  if (quantity <= 0) {
    return removeGuestCartItem(productId);
  }

  return setGuestCart(
    getGuestCart().map((item) =>
      item.productId === productId ? { ...item, quantity } : item,
    ),
  );
}

export function removeGuestCartItem(productId) {
  return setGuestCart(
    getGuestCart().filter((item) => item.productId !== productId),
  );
}

export function getGuestCartId(productId) {
  return `guest-${productId}`;
}
