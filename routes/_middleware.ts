import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getCookies, setCookie } from "cookie";
import { create } from "djwt";
import {
  createKey,
  getSession,
  Session,
  sessionExists,
  State,
} from "../mod.ts";

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext<State>,
) {
  const { sessionId } = getCookies(req.headers);
  // const params = !cookieOptions ? {} : cookieOptions;
  const key = await createKey(Deno.env.get("APP_SECRET") || "her der sercet");

  if (sessionId && (await sessionExists(sessionId, key))) {
    ctx.state.session = getSession(sessionId);
  }

  if (!ctx.state.session) {
    console.log("session not found! Instantiating one now.");
    ctx.state.session = new Session();
    ctx.state.session.set("id", crypto.randomUUID());
  }

  const response = await ctx.next();
  setCookie(response.headers, {
    name: "sessionId",
    value: await create(
      { alg: "HS512", typ: "JWT" },
      { ...ctx.state.session.data, flash: ctx.state.session.flashedData },
      key,
    ),
    path: "/",
    // ...params,
  });

  return response;
}
