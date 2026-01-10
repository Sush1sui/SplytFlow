export default function extractBefore(
  input: string,
  delimiter: string
): string {
  const index = input.indexOf(delimiter);
  if (index === -1) return input;
  return input.substring(0, index);
}
