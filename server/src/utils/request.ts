export function getClientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const real = headers.get("x-real-ip")?.trim();
  if (real) {
    return real;
  }

  return "unknown";
}
