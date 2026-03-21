import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";

export async function requestOTP(email: string, purpose = "signup") {
  try {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.OTP.GENERATE}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to request OTP");
    }

    const data = await response.json();

    if (data.message === "OTP generated successfully") return true;

    return false;
  } catch (error) {
    throw error;
  }
}

export async function verify(email: string, code: string, purpose = "signup") {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.OTP.VERIFY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, purpose }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to verify OTP");
    }

    const data = await response.json();

    if (data.message === "OTP verified successfully") return true;

    return false;
  } catch (error) {
    throw error;
  }
}
