import { BACKEND } from "./config";
import { getToken } from "./auth";

export interface CheckoutOptions {
  tier: "starter" | "creator" | "pro";
  successUrl?: string;
  cancelUrl?: string;
}

export async function createCheckoutSession(opts: CheckoutOptions): Promise<string> {
  const token = getToken();
  if (!token) throw new Error("You must be signed in to subscribe");

  const res = await fetch(`${BACKEND}/stripe/create-checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      tier: opts.tier,
      success_url: opts.successUrl || `${window.location.origin}/pricing?success=1`,
      cancel_url:  opts.cancelUrl  || `${window.location.origin}/pricing?cancelled=1`,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create checkout session");
  return data.checkout_url as string;
}

export async function openCustomerPortal(): Promise<string> {
  const token = getToken();
  if (!token) throw new Error("You must be signed in");

  const res = await fetch(`${BACKEND}/stripe/portal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      return_url: `${window.location.origin}/pricing`,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to open portal");
  return data.portal_url as string;
}
