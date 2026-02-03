const BASE_URL = import.meta.env.VITE_API_BACKEND_URL;

export const submitContactForm = async (payload) => {
  const response = await fetch(`${BASE_URL}/contact/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to send message");
  }

  return await response.json();
};
