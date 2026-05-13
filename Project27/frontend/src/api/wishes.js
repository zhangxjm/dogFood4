const API_BASE = "/api/wishes";

export async function getWishes(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}${query ? "?" + query : ""}`);
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  return res.json();
}

export async function createWish(wish) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(wish),
  });
  return res.json();
}

export async function updateWish(id, updates) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function deleteWish(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  return res.json();
}
