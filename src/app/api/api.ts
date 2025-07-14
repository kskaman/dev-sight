export const api = {
  get: <T>(url: string) =>
    fetch(url, { credentials: "include" }).then((r) => r.json() as Promise<T>),

  post: <T>(url: string, body: unknown) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    }).then((r) => r.json() as Promise<T>),

  del: (url: string) =>
    fetch(url, { method: "DELETE", credentials: "include" }),

  patch: <T>(url: string, body: unknown) =>
    fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    }).then((r) => r.json() as Promise<T>),
};
