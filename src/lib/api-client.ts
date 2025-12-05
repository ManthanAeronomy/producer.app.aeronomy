import type {
  Tender,
  CreateTenderInput,
  UpdateTenderInput,
  CreateBidInput,
  Bid,
} from "@/types/tender";

const API_BASE = "/api";

export const apiClient = {
  // Tender endpoints
  async getTenders(): Promise<Tender[]> {
    try {
      const response = await fetch(`${API_BASE}/tenders`);
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = "Failed to fetch tenders";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();
      return data.tenders || [];
    } catch (error) {
      console.error("Error in getTenders:", error);
      throw error;
    }
  },

  async getTender(id: string): Promise<Tender> {
    const response = await fetch(`${API_BASE}/tenders/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Tender not found");
      }
      throw new Error("Failed to fetch tender");
    }
    const data = await response.json();
    return data.tender;
  },

  async createTender(input: CreateTenderInput): Promise<Tender> {
    const response = await fetch(`${API_BASE}/tenders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create tender");
    }
    const data = await response.json();
    return data.tender;
  },

  async updateTender(
    id: string,
    input: UpdateTenderInput
  ): Promise<Tender> {
    const response = await fetch(`${API_BASE}/tenders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Tender not found");
      }
      const error = await response.json();
      throw new Error(error.error || "Failed to update tender");
    }
    const data = await response.json();
    return data.tender;
  },

  async deleteTender(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/tenders/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Tender not found");
      }
      throw new Error("Failed to delete tender");
    }
  },

  // Bid endpoints
  async getBids(tenderId?: string): Promise<Bid[]> {
    const url = tenderId
      ? `${API_BASE}/bids?tenderId=${tenderId}`
      : `${API_BASE}/bids`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch bids");
    }
    const data = await response.json();
    return data.bids;
  },

  async createBid(input: CreateBidInput): Promise<Bid> {
    const response = await fetch(`${API_BASE}/bids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create bid");
    }
    const data = await response.json();
    return data.bid;
  },
};



