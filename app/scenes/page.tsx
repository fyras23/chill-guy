import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyAdminUser } from "@/lib/auth/admin-check";
import { getAllScenesAdmin } from "@/lib/actions/scenes";
import { getAllDefaultTracksAdmin } from "@/lib/actions/playlist";
import { Logo } from "@/components/deck/Logo";
import { ScenesManager } from "./ScenesManager";
import { ArrowLeft } from "lucide-react";

export default async function ScenesPage() {
  const { isAdmin } = await verifyAdminUser();

  if (!isAdmin) {
    redirect("/login?redirect=/scenes");
  }

  let scenes: Awaited<ReturnType<typeof getAllScenesAdmin>> = [];
  let tracks: Awaited<ReturnType<typeof getAllDefaultTracksAdmin>> = [];

  try {
    scenes = await getAllScenesAdmin();
  } catch (err) {
    console.error("Error loading scenes in admin page:", err);
  }

  try {
    tracks = await getAllDefaultTracksAdmin();
  } catch (err) {
    console.error("Error loading tracks in admin page:", err);
  }

  return (
    <main className="min-h-screen flex flex-col bg-surface p-4 md:p-8">
      {/* Top Navigation */}
      <header className="flex items-center justify-between pb-6 mb-6 border-b-2 border-primary/20 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="hidden sm:inline-block px-2.5 py-0.5 bg-primary text-surface-raised font-body font-bold text-xs rounded-sm">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/api/admin/logout"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-raised text-primary border-[2px] border-primary rounded-md font-bold font-body text-sm shadow-sticker hover:-translate-x-px hover:-translate-y-px transition-all focus-ring"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            <span>Back to deck</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full flex-1">
        <div className="mb-6">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-primary mb-1">
            Chill Guy Studio Manager
          </h1>
          <p className="font-body text-sm text-text-muted">
            Manage the default &quot;Chill Guy&quot; playlist and background Vibe scenes.
          </p>
        </div>

        <ScenesManager initialScenes={scenes} initialTracks={tracks} />
      </div>
    </main>
  );
}
