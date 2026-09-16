import { PlantProfile } from "@/components/PlantProfile";
import { dayOffset } from "@/lib/day";

export const metadata = { title: "Plant - Rooted" };

export default async function Plant({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlantProfile plantId={id} offset={await dayOffset()} />;
}
