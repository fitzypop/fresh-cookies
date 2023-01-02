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
  const { auth } = getCookies(req.headers);
  const key = await createKey(Deno.env.get("APP_SECRET") || "her der sercet");

  if (auth && (await sessionExists(auth, key))) {
    ctx.state.session = getSession(auth);
  }

  if (!ctx.state.session) {
    console.log("session not found! Instantiating one now.");
    ctx.state.session = new Session();
    ctx.state.session.set("id", crypto.randomUUID());
  }

  const response = await ctx.next();
  setCookie(response.headers, {
    name: "auth",
    value: await create(
      { alg: "HS512", typ: "JWT" },
      { ...ctx.state.session.data, flash: ctx.state.session.flashedData },
      key,
    ),
    // maxAge: 120,
    sameSite: "Lax",
    domain: new URL(req.url).hostname,
    path: "/",
    secure: true,
  });
  response.headers.set("location", "/");
  return response;
}
