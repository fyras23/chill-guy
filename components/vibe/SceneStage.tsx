"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Scene } from "@/lib/supabase/types";
import { useSettingsStore } from "@/lib/settings-store";
import { ElapsedSceneClock, getNextBagScene } from "@/lib/scene-engine/bag-scheduler";
import { generateDriftKeyframes, applyDriftAnimation } from "@/lib/scene-engine/drift";
import { pickNextTransition, executeTransition, type TransitionType } from "@/lib/scene-engine/transitions/registry";
import { imagePreloadCache } from "@/lib/scene-engine/preload";
import { FallbackScene } from "./FallbackScene";

interface SceneStageProps {
  scenes: Scene[];
  isPlaying: boolean;
}

interface ActiveSceneLayer {
  scene: Scene;
  driftKeyframes: ReturnType<typeof generateDriftKeyframes>;
}

export function SceneStage({ scenes, isPlaying }: SceneStageProps) {
  const sceneInterval = useSettingsStore((s) => s.sceneInterval);
  const transitionFeel = useSettingsStore((s) => s.transitionFeel);
  const shuffleScenes = useSettingsStore((s) => s.shuffleScenes);
  const driftMotion = useSettingsStore((s) => s.driftMotion);
  const fitMode = useSettingsStore((s) => s.fitMode);

  // Active scene bag
  const bagRef = useRef<Scene[]>([]);
  const lastTransitionRef = useRef<TransitionType | undefined>(undefined);

  const [currentLayer, setCurrentLayer] = useState<ActiveSceneLayer | null>(null);
  const [outgoingLayer, setOutgoingLayer] = useState<ActiveSceneLayer | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentLayerRef = useRef<HTMLDivElement>(null);
  const outgoingLayerRef = useRef<HTMLDivElement>(null);
  const lightLeakRef = useRef<HTMLDivElement>(null);

  const currentDriftAnimRef = useRef<Animation | null>(null);
  const clockRef = useRef<ElapsedSceneClock>(new ElapsedSceneClock(sceneInterval));
  const isPreloadedNextRef = useRef(false);

  // Sync clock duration with settings
  useEffect(() => {
    clockRef.current.setDuration(sceneInterval);
  }, [sceneInterval]);

  // Handle play/pause on clock and drift animations
  useEffect(() => {
    if (isPlaying) {
      clockRef.current.start();
      currentDriftAnimRef.current?.play();
    } else {
      clockRef.current.pause();
      currentDriftAnimRef.current?.pause();
    }
  }, [isPlaying]);

  // Initial scene setup
  useEffect(() => {
    if (scenes.length === 0) return;

    if (!currentLayer) {
      const frame = requestAnimationFrame(() => {
        const { nextScene, remainingBag } = getNextBagScene(scenes, bagRef.current, undefined, shuffleScenes);
        bagRef.current = remainingBag;

        if (nextScene) {
          const drift = generateDriftKeyframes();
          setCurrentLayer({ scene: nextScene, driftKeyframes: drift });
          clockRef.current.reset();
          if (isPlaying) clockRef.current.start();
        }
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [scenes, currentLayer, shuffleScenes, isPlaying]);

  // Apply drift animation to current layer
  useEffect(() => {
    if (!currentLayer || !currentLayerRef.current) return;

    if (driftMotion) {
      const maxTransDuration = 6000;
      const totalDuration = (sceneInterval * 1000) + maxTransDuration;
      const anim = applyDriftAnimation(
        currentLayerRef.current,
        currentLayer.driftKeyframes,
        totalDuration
      );
      currentDriftAnimRef.current = anim;
      if (!isPlaying) anim?.pause();
    } else {
      currentDriftAnimRef.current?.cancel();
      currentDriftAnimRef.current = null;
    }

    return () => {
      currentDriftAnimRef.current?.cancel();
    };
  }, [currentLayer, driftMotion, sceneInterval, isPlaying]);

  // Clock tick & transition trigger loop
  useEffect(() => {
    let animFrame: number;

    const tickLoop = async () => {
      if (isPlaying && scenes.length > 1 && !isTransitioning) {
        const { isComplete, elapsedMs } = clockRef.current.tick();

        // Preload next scene 8s before completion
        const remainingMs = sceneInterval * 1000 - elapsedMs;
        if (remainingMs <= 8000 && !isPreloadedNextRef.current) {
          isPreloadedNextRef.current = true;
          const { nextScene } = getNextBagScene(scenes, bagRef.current, currentLayer?.scene.id, shuffleScenes);
          if (nextScene) {
            imagePreloadCache.preloadAndDecode(nextScene.url, 8000);
          }
        }

        if (isComplete) {
          setIsTransitioning(true);
          isPreloadedNextRef.current = false;

          const { nextScene, remainingBag } = getNextBagScene(
            scenes,
            bagRef.current,
            currentLayer?.scene.id,
            shuffleScenes
          );
          bagRef.current = remainingBag;

          if (nextScene && nextScene.id !== currentLayer?.scene.id) {
            // Ensure next scene is decoded
            await imagePreloadCache.preloadAndDecode(nextScene.url, 4000);

            const nextDrift = generateDriftKeyframes();
            const nextLayerData = { scene: nextScene, driftKeyframes: nextDrift };

            // Rotate layers
            setOutgoingLayer(currentLayer);
            setCurrentLayer(nextLayerData);

            // Execute transition on next frame
            requestAnimationFrame(() => {
              const transParams = pickNextTransition(lastTransitionRef.current, transitionFeel);
              lastTransitionRef.current = transParams.type;

              if (currentLayerRef.current) {
                const trans = executeTransition(
                  currentLayerRef.current,
                  outgoingLayerRef.current,
                  transParams,
                  lightLeakRef.current
                );

                trans.finished.then(() => {
                  setOutgoingLayer(null);
                  setIsTransitioning(false);
                  clockRef.current.reset();
                  if (isPlaying) clockRef.current.start();
                });
              } else {
                setOutgoingLayer(null);
                setIsTransitioning(false);
                clockRef.current.reset();
              }
            });
          } else {
            setIsTransitioning(false);
            clockRef.current.reset();
          }
        }
      }

      animFrame = requestAnimationFrame(tickLoop);
    };

    animFrame = requestAnimationFrame(tickLoop);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, scenes, isTransitioning, sceneInterval, currentLayer, shuffleScenes, transitionFeel]);

  if (scenes.length === 0 || !currentLayer) {
    return <FallbackScene isPlaying={isPlaying} />;
  }

  const renderSceneImage = (layer: ActiveSceneLayer, isOutgoing: boolean) => {
    return (
      <div
        ref={isOutgoing ? outgoingLayerRef : currentLayerRef}
        key={layer.scene.id}
        className="absolute inset-0 w-full h-full overflow-hidden"
      >
        {fitMode === "fit" ? (
          <>
            {/* Soft static backdrop from same image */}
            <div
              className="absolute inset-0 w-full h-full filter blur-2xl opacity-60 scale-110 pointer-events-none"
              style={{
                backgroundImage: `url(${layer.scene.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            {/* Uncropped original image on top */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={layer.scene.url}
              alt=""
              className="relative w-full h-full object-contain pointer-events-none"
            />
          </>
        ) : (
          /* Plain un-optimized cover image serving original quality */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={layer.scene.url}
            alt=""
            className="w-full h-full object-cover pointer-events-none"
          />
        )}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-primary select-none">
      {outgoingLayer && renderSceneImage(outgoingLayer, true)}
      {currentLayer && renderSceneImage(currentLayer, false)}

      {/* Warm light leak overlay element for warm-light-leak transition */}
      <div
        ref={lightLeakRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-0 bg-gradient-to-tr from-secondary/60 via-warning/40 to-transparent mix-blend-screen"
      />
    </div>
  );
}

