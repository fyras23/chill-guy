import React, { Suspense } from "react";
import { getActiveScenes } from "@/lib/actions/scenes";
import { HomeClient } from "@/components/deck/HomeClient";

export const instant = false;

export default async function HomePage() {
  const activeScenes = await getActiveScenes();

  return (
    <Suspense fallback={null}>
      <HomeClient initialScenes={activeScenes} />
    </Suspense>
  );
}
