"use client";

import React from "react";
import Link from "next/link";
import { usePlayerStore } from "@/lib/audio/player-store";
import type { Scene } from "@/lib/supabase/types";
import type { DefaultTrackDTO } from "@/lib/actions/playlist";
import { Logo } from "./Logo";
import { CassetteDeck } from "./CassetteDeck";
import { Skyline } from "./Skyline";
import { QueueDrawer } from "@/components/queue/QueueDrawer";
import { DropZone } from "@/components/queue/DropZone";
import { VibeRoot } from "@/components/vibe/VibeRoot";
import { Button } from "@/components/ui/Button";
import { Sparkles, Image as ImageIcon } from "lucide-react";

interface HomeClientProps {
  initialScenes: Scene[];
  defaultPlaylist?: DefaultTrackDTO[];
}

export function HomeClient({ initialScenes, defaultPlaylist = [] }: HomeClientProps) {
  const queue = usePlayerStore((s) => s.queue);
  const setVibeActive = usePlayerStore((s) => s.setVibeActive);

  const hasTunes = queue.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-surface overflow-x-hidden selection:bg-secondary selection:text-primary">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between select-none border-b-2 border-primary/10">
        <Logo />

        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Scenes Manager link */}
          <Link
            href="/scenes"
            title="Manage Vibe Scenes & Playlist"
            aria-label="Manage Vibe Scenes & Playlist"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface-raised text-primary border-[2px] border-primary rounded-md font-bold font-body text-xs sm:text-sm shadow-sticker hover:-translate-x-px hover:-translate-y-px transition-all focus-ring"
          >
            <ImageIcon className="w-4 h-4 text-primary" strokeWidth={2.5} />
            <span className="hidden sm:inline">Admin</span>
          </Link>

          {/* Vibe Mode button */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setVibeActive(true)}
            title="Enter Vibe Mode"
            aria-label="Enter Vibe Mode"
            className="text-xs sm:text-sm"
          >
            <Sparkles className="w-4 h-4 text-secondary" strokeWidth={2.5} />
            <span>Vibe</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex flex-col justify-center">
        {!hasTunes ? (
          /* Empty state: Large Friendly Rooftop Drop Zone with Chill Guy Tape feature */
          <div className="w-full max-w-2xl mx-auto my-auto animate-in fade-in duration-300">
            <DropZone defaultPlaylist={defaultPlaylist} />
          </div>
        ) : (
          /* Populated state: Desktop side-by-side or Mobile stacked layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start justify-center">
            {/* Cassette Deck Hero (Centered on mobile, takes 7 cols on desktop) */}
            <div className="lg:col-span-7 flex justify-center w-full">
              <CassetteDeck />
            </div>

            {/* Queue / Tape Stack (Takes 5 cols on desktop, hidden on mobile in favor of bottom sheet) */}
            <div className="hidden lg:block lg:col-span-5 w-full sticky top-8">
              <QueueDrawer isMobileDrawer={false} defaultPlaylist={defaultPlaylist} />
            </div>
          </div>
        )}

        {/* Mobile Bottom Sheet Queue */}
        <QueueDrawer isMobileDrawer={true} defaultPlaylist={defaultPlaylist} />
      </main>

      {/* Static City Skyline Silhouette along bottom with lit windows */}
      <Skyline />

      {/* Fullscreen Vibe Mode Layer */}
      <VibeRoot scenes={initialScenes} />
    </div>
  );
}
