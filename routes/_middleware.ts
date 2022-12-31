import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getCookies, setCookie } from "cookie";
import { create, verify } from "djwt";
import { createKey, Session, State } from "../mod.ts";

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  const { sessionId } = getCookies(req.headers);
  const secret = Deno.env.get("APP_KEY") || "supa dupa secret!";
  const key = await createKey(secret);

  try {
    const payload = await verify(sessionId, key);
    const { ...data } = payload;
    ctx.state.session = new Session(data);
  } catch (_e) {
    console.warn("Invalid JWT token, creating new session...");
  }

  if (!ctx.state.session) {
    ctx.state.session = new Session();
  }

  const response = await ctx.next();

  setCookie(response.headers, {
    name: "sessionId",
    value: await create(
      { alg: "HS512", typ: "JWT" },
      { ...ctx.state.session.data },
      key,
    ),
    path: "/",
    // ...this.#cookieOptions,
  });

  return response;
}
