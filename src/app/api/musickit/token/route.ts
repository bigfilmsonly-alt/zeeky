export async function GET() {
  const token = process.env.APPLE_MUSICKIT_TOKEN;
  if (!token) {
    return Response.json({ configured: false });
  }
  return Response.json({ configured: true, token });
}
