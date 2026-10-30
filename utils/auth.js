// Simple auth utility for localStorage
export const authUtils = {
  setToken: (token, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));
    }
  },

  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  },

  getUser: () => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }
  },

  isAuthenticated: () => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("authToken");
    }
    return false;
  },
};
