import { readAllContent } from "@/studio/server/content";
import { Harness } from "./Harness";

// TEMPORARY check for the Photos and Collections panels and the artboard field. Delete after review.
export const dynamic = "force-dynamic";

export default async function Page() {
  return <Harness initial={await readAllContent()} />;
}
