import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { plan } = await request.json();

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET) {
    return Response.json(
      { error: "Stripe not configured", fallback: true },
      { status: 503 }
    );
  }

  // When Stripe is configured, this would create a checkout session
  // const stripe = new Stripe(STRIPE_SECRET);
  // const session = await stripe.checkout.sessions.create({...});
  // return Response.json({ url: session.url });

  return Response.json({ error: "Not implemented yet", fallback: true }, { status: 503 });
}
