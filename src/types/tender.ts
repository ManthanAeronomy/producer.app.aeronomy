export type Tender = {
  id: string;
  airline: string;
  lotName: string;
  volume: number;
  volumeUnit: "MT" | "gal";
  pricePerUnit: number;
  currency: "USD" | "EUR" | "GBP";
  ciScore: number;
  location: string;
  deliveryWindow: string;
  longTerm: boolean;
  postedOn: string;
};

export type Bid = {
  id: string;
  tenderId: string;
  volume: number;
  price: number;
  notes: string;
  submittedAt: string;
};

export type CreateTenderInput = {
  airline: string;
  lotName: string;
  volume: number;
  volumeUnit: "MT" | "gal";
  pricePerUnit: number;
  currency: "USD" | "EUR" | "GBP";
  ciScore: number;
  location: string;
  deliveryWindow: string;
  longTerm: boolean;
  postedOn: string;
};

export type UpdateTenderInput = Partial<CreateTenderInput>;

export type CreateBidInput = {
  tenderId: string;
  volume: number;
  price: number;
  notes: string;
};

























