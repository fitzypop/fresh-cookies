import { Cookie } from "https://deno.land/std@0.86.0/http/cookie.ts";

export class Session {
  #data = new Map();

  constructor(data = {}) {
    this.#data = new Map(Object.entries(data));
  }

  get data() {
    return Object.fromEntries(this.#data);
  }

  set(key: string, value: any) {
    this.#data.set(key, value);

    return this;
  }

  get(key: string) {
    return this.#data.get(key);
  }

  has(key: string) {
    return this.#data.has(key);
  }

  clear() {
    this.#data.clear();
    return this;
  }
}

export type State = { session: Session };

export type CookieOptions = Omit<Cookie, "name" | "value">;

export async function createKey(secret: string) {
  return await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret || "not-secret"),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign", "verify"],
  );
}
