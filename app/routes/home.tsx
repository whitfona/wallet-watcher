import type { Route } from "./+types/home";
import { Dashboard } from "~/dashboard/dashboard";

export function meta({}: Route.MetaArgs) {

}

export default function Home() {
  return <Dashboard />;
}
