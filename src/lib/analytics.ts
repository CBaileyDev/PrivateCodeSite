export function shouldEnableVercelInsights(vercel?: string): boolean {
  return vercel === "1";
}
