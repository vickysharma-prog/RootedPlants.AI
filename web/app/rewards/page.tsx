import { RewardsBoard } from "@/components/RewardsBoard";
import { dayOffset } from "@/lib/day";

export const metadata = { title: "Rewards - Rooted" };

export default async function Rewards() {
  return <RewardsBoard offset={await dayOffset()} />;
}
