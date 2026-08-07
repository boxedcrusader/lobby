import { redirect } from "next/navigation";

// TODO: this becomes a real landing page once multiple businesses exist.
export default function Home() {
  redirect("/b/imani-stays");
}
