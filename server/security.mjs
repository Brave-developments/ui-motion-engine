import { URL } from 'node:url';
import path from 'node:path';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);
export function assertLocalUrl(input) {
  if (typeof input !== 'string' || input.length > 2048) throw new Error('A valid local URL is required.');
  const url = new URL(input);
  if (!['http:', 'https:'].includes(url.protocol) || !LOCAL_HOSTS.has(url.hostname) || url.username || url.password) {
    throw new Error('Only local http(s) sites without embedded credentials are permitted.');
  }
  if (![80, 443, 3000, 4173, 5173, 5174, 8787, 8080, 8000, 4200].includes(Number(url.port || (url.protocol === 'https:' ? 443 : 80)))) {
    throw new Error('Local port is not approved. Add an explicit allowlist entry in server/security.mjs.');
  }
  return url;
}
export function isAllowedAssetUrl(value, allowExternalAssets = false) {
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) return false;
    if (LOCAL_HOSTS.has(url.hostname)) return true;
    if (!allowExternalAssets) return false;
    if (url.protocol !== 'https:' || url.username || url.password) return false;
    const h = url.hostname.toLowerCase();
    if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal') || h.endsWith('.test') || h.endsWith('.invalid')) return false;
    if (/^(?:\d+\.){3}\d+$/.test(h) || h.includes(':')) return false;
    return true;
  } catch { return false; }
}
export function safeChildPath(root, relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\0')) throw new Error('Invalid path');
  const resolved = path.resolve(root, relative.replaceAll('\\', '/'));
  if (resolved !== path.resolve(root) && !resolved.startsWith(path.resolve(root) + path.sep)) throw new Error('Path traversal blocked');
  return resolved;
}
export function validateSettings(payload = {}) {
  if (!payload || typeof payload !== 'object') throw new Error('Expected object');
  const url = assertLocalUrl(payload.url).toString();
  const width = Number(payload.width ?? 1440), height = Number(payload.height ?? 810);
  const fps = Number(payload.fps ?? 30), intensity = Number(payload.intensity ?? 65);
  if (!Number.isInteger(width) || width < 360 || width > 1920 || !Number.isInteger(height) || height < 360 || height > 1080) throw new Error('Viewport out of bounds (360–1920 × 360–1080)');
  if (![24, 25, 30, 60].includes(fps)) throw new Error('FPS must be 24, 25, 30 or 60');
  if (!Number.isFinite(intensity) || intensity < 0 || intensity > 100) throw new Error('Intensity must be 0–100');
  const prompt = String(payload.prompt ?? '').slice(0, 800);
  return {url, width, height, fps, intensity, prompt, allowExternalAssets: payload.allowExternalAssets === true};
}
