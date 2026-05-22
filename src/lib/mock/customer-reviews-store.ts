export type CustomerReview = {
  id: string;
  orderId: string;
  userId: string;
  productName: string;
  rating: number;
  comment: string;
  createdAt: string;
  customerEmail?: string;
  customerName?: string;
};

// In-memory storage for reviews
const customerReviews: CustomerReview[] = [
  {
    id: "review-1",
    orderId: "ord-001",
    userId: "user-1",
    productName: "Silk blend saree · Emerald",
    rating: 4,
    comment: "Great quality fabric and beautiful color. Arrived on time.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    customerEmail: "priya@example.com",
    customerName: "Priya",
  },
  {
    id: "review-2",
    orderId: "ord-002",
    userId: "user-2",
    productName: "High-rise denim jacket · Blue",
    rating: 5,
    comment: "Perfect fit and excellent quality. Highly recommended!",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    customerEmail: "john@example.com",
    customerName: "John",
  },
];

export async function getCustomerReviews(): Promise<CustomerReview[]> {
  return customerReviews;
}

export async function addCustomerReview(
  orderId: string,
  userId: string,
  productName: string,
  rating: number,
  comment: string,
  customerEmail?: string,
  customerName?: string
): Promise<CustomerReview> {
  const review: CustomerReview = {
    id: `review-${Date.now()}`,
    orderId,
    userId,
    productName,
    rating,
    comment,
    createdAt: new Date().toISOString(),
    customerEmail,
    customerName,
  };

  customerReviews.push(review);
  return review;
}

export async function deleteCustomerReview(reviewId: string): Promise<boolean> {
  const index = customerReviews.findIndex((r) => r.id === reviewId);
  if (index !== -1) {
    customerReviews.splice(index, 1);
    return true;
  }
  return false;
}
