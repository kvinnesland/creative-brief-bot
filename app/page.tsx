import { redirect } from "next/navigation";

// Root route redirects to /sessions (middleware handles auth guard)
export default function Home() {
  redirect("/sessions");
}
