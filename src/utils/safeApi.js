export const safeApi = async (request) => {
  try {
    const res = await request;

    if (!res?.data?.success) {
      throw new Error(res.data?.message || "API error");
    }

    return res.data.data;
  } catch (error) {
    console.error("API Error:", error);

    if (!error.response) {
      throw new Error("Network error. Please check connection.");
    }

    if (error.response.status === 401) {
      throw new Error("Session expired. Please login again.");
    }

    if (error.response.status === 403) {
      throw new Error("Access denied.");
    }

    if (error.response.status === 500) {
      throw new Error("Server error.");
    }

    throw new Error(
      error.response?.data?.message || error.message || "Unknown error",
    );
  }
};
