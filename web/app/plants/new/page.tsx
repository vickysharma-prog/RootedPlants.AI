import { AddPlant } from "@/components/AddPlant";
import { dayOffset } from "@/lib/day";

export const metadata = { title: "Add a plant - Rooted" };

export default async function New() {
  return <AddPlant offset={await dayOffset()} />;
}
