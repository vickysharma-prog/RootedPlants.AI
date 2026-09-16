import { PlantsBoard } from "@/components/PlantsBoard";
import { dayOffset } from "@/lib/day";

export const metadata = { title: "Your plants - Rooted" };

export default async function Plants() {
  return <PlantsBoard offset={await dayOffset()} />;
}
