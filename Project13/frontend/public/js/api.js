const API_BASE = "http://localhost:8080/api";

const request = {
  get(url, params) {
    let fullUrl = API_BASE + url;
    if (params) {
      const queryString = Object.keys(params)
        .filter(
          (k) =>
            params[k] !== undefined && params[k] !== null && params[k] !== "",
        )
        .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
        .join("&");
      if (queryString) {
        fullUrl += "?" + queryString;
      }
    }
    return fetch(fullUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((res) => res.json());
  },
  post(url, data) {
    return fetch(API_BASE + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },
  put(url, data) {
    return fetch(API_BASE + url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  },
  delete(url) {
    return fetch(API_BASE + url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }).then((res) => res.json());
  },
};

const productApi = {
  list(params) {
    return request.get("/products", params);
  },
  get(id) {
    return request.get("/products/" + id);
  },
  save(data) {
    return request.post("/products", data);
  },
  update(id, data) {
    return request.put("/products/" + id, data);
  },
  delete(id) {
    return request.delete("/products/" + id);
  },
  updateStock(data) {
    return request.put("/products/stock", data);
  },
};

const categoryApi = {
  list() {
    return request.get("/categories");
  },
  save(data) {
    return request.post("/categories", data);
  },
  update(id, data) {
    return request.put("/categories/" + id, data);
  },
  delete(id) {
    return request.delete("/categories/" + id);
  },
};
