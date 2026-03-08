// URL de l'API centrale — utilise d'abord une variable d'environnement
// En développement local, définissez `API_BASE` ou laissez le fallback sur http://localhost:8083
function resolveApiBase() {
	// 1) If explicitly set on globalThis (useful for tests or static pages)
	if (typeof globalThis !== 'undefined' && globalThis.API_BASE) return globalThis.API_BASE;

	// 2) If running in a browser, prefer the current host with backend port 8083
	if (typeof window !== 'undefined') {
		if (window.API_BASE) return window.API_BASE;
		const proto = window.location.protocol || 'http:';
		const hostname = window.location.hostname || 'localhost';
		return `${proto}//${hostname}:8083`;
	}

	// 3) Fall back to process.env for Node (mobile, server-side)
	if (typeof process !== 'undefined' && process.env && process.env.API_BASE) return process.env.API_BASE;

	// 4) Default fallback
	return 'http://localhost:8083';
}

export const API_BASE = resolveApiBase();
