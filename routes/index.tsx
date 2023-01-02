import { Head } from "$fresh/runtime.ts";
import Counter from "../islands/Counter.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>Fresh Cookies</title>
      </Head>
      <main class="h-screen w-screen bg-gray-800 text-white">
        <div class="p-4 mx-auto max-w-screen-md">
          <img
            src="/logo.svg"
            class="w-32 h-32"
            alt="the fresh logo: a sliced lemon dripping with juice"
          />
          <p class="my-6">
            Welcome to Fresh App. All it does is set and get cookies. Check
            chrome devtools.
          </p>
          <Counter start={3} />
        </div>
      </main>
    </>
  );
}
