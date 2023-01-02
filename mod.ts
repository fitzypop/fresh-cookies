import { Cookie } from "cookie";
import { decode, verify } from "djwt";

// export type State = { session: Map<unknown, unknown> };
export type State = { session: Session };

export type CookieOptions = Omit<Cookie, "name" | "value">;

export async function createKey(secret?: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret || "her der sercet"),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign", "verify"],
  );
}

export async function sessionExists(
  sessionId: string,
  key: CryptoKey,
): Promise<boolean> {
  try {
    await verify(sessionId, key);
    return true;
  } catch (e) {
    return false;
  }
}

export function getSession(sessionId: string): Session {
  const [, payload] = decode(sessionId);
  const { flash = {}, ...data } = payload;
  return new Session(data as object, flash);
}

export class Session {
  #data = new Map();
  #flash = new Map();

  constructor(data = {}, flash = {}) {
    this.#data = new Map(Object.entries(data));
    this.#flash = new Map(Object.entries(flash));
  }

  get data() {
    return Object.fromEntries(this.#data);
  }

  get flashedData() {
    return Object.fromEntries(this.#flash);
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

  flash(key: string, value?: any) {
    if (value === undefined) {
      const flashedValue = this.#flash.get(key);

      this.#flash.delete(key);

      return flashedValue;
    }
    this.#flash.set(key, value);

    return this;
  }
}
