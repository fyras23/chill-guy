"use client";

import React, { useRef, useState } from "react";
import { usePlayerStore } from "@/lib/audio/player-store";
import { TapeSpine } from "./TapeSpine";
import { DropZone } from "./DropZone";
import { Trash2, X, Plus } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface QueueDrawerProps {
  isMobileDrawer?: boolean;
}

export function QueueDrawer({ isMobileDrawer = false }: QueueDrawerProps) {
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isQueueOpen = usePlayerStore((s) => s.isQueueOpen);

  const setCurrentIndex = usePlayerStore((s) => s.setCurrentIndex);
  const removeTrack = usePlayerStore((s) => s.removeTrack);
  const clearQueue = usePlayerStore((s) => s.clearQueue);
  const setQueueOpen = usePlayerStore((s) => s.setQueueOpen);
  const reorderQueue = usePlayerStore((s) => s.reorderQueue);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showAddMore, setShowAddMore] = useState(false);

  // Virtualizer container ref for 100+ items
  const parentRef = useRef<HTMLDivElement>(null);
  const isVirtualized = queue.length > 100;

  const rowVirtualizer = useVirtualizer({
    count: queue.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64, // 56px height + 8px gap
    overscan: 10,
    enabled: isVirtualized,
  });

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    reorderQueue(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (isMobileDrawer && !isQueueOpen) {
    return null;
  }

  const content = (
    <div className="flex flex-col h-full bg-surface-raised border-[2.5px] border-primary rounded-lg shadow-sticker p-4 md:p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-primary/20">
        <div>
          <h2 className="font-display text-lg md:text-xl font-bold text-primary">
            Tape Stack
          </h2>
          <p className="font-body text-xs text-text-muted">
            {queue.length} tune{queue.length === 1 ? "" : "s"} queued
          </p>
        </div>

        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <>
              <button
                type="button"
                title={showAddMore ? "Hide tune picker" : "Add more tunes"}
                aria-label="Add more tunes"
                onClick={() => setShowAddMore(!showAddMore)}
                className="p-2 rounded-sm text-primary hover:bg-surface-sunken transition-colors focus-ring"
              >
                <Plus className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                title="Clear queue"
                aria-label="Clear queue"
                onClick={() => clearQueue()}
                className="p-2 rounded-sm text-danger hover:bg-surface-sunken transition-colors focus-ring"
              >
                <Trash2 className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </>
          )}
          {isMobileDrawer && (
            <button
              type="button"
              aria-label="Close queue"
              onClick={() => setQueueOpen(false)}
              className="p-2 rounded-sm text-primary hover:bg-surface-sunken transition-colors focus-ring"
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Add more dropzone toggle */}
      {showAddMore && (
        <div className="mb-4">
          <DropZone compact />
        </div>
      )}

      {/* Queue Items */}
      {queue.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <DropZone compact />
        </div>
      ) : isVirtualized ? (
        <div
          ref={parentRef}
          className="flex-1 overflow-y-auto pr-1"
          style={{ height: "420px", maxHeight: "65vh" }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const track = queue[virtualRow.index];
              return (
                <div
                  key={track.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  draggable
                  onDragStart={() => handleDragStart(virtualRow.index)}
                  onDragOver={(e) => handleDragOver(e, virtualRow.index)}
                  onDragEnd={handleDragEnd}
                >
                  <TapeSpine
                    track={track}
                    index={virtualRow.index}
                    isCurrent={virtualRow.index === currentIndex}
                    isPlaying={isPlaying}
                    onSelect={() => setCurrentIndex(virtualRow.index)}
                    onRemove={() => removeTrack(track.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 max-h-[500px]">
          {queue.map((track, idx) => (
            <div
              key={track.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className="transition-transform"
            >
              <TapeSpine
                track={track}
                index={idx}
                isCurrent={idx === currentIndex}
                isPlaying={isPlaying}
                onSelect={() => setCurrentIndex(idx)}
                onRemove={() => removeTrack(track.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (isMobileDrawer) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col justify-end bg-primary/40 md:hidden"
        onClick={() => setQueueOpen(false)}
      >
        <div
          className="w-full max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    );
  }

  return <div className="w-full">{content}</div>;
}

