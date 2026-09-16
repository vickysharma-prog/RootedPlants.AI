import { CaptureFlow } from "@/components/CaptureFlow";
import { dayOffset } from "@/lib/day";

export const metadata = { title: "Prove it - Rooted" };

export default async function Do({ params }: PageProps<"/do/[task]">) {
  const { task } = await params;
  return <CaptureFlow taskId={task} offset={await dayOffset()} />;
}
