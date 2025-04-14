import {
  IDesign,
  ISize,
  IText,
  ITrackItemAndDetails,
} from "@designcombo/types";
import { useCallback, useEffect, useState } from "react";
import { loadFont } from "@remotion/fonts";
import {
  continueRender,
  delayRender,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { IFont } from "../types";
import { groupTrackItems } from "../utils/group-items";
import { SequenceItem } from "./sequence-item";
import { TransitionSeries } from "@remotion/transitions";
import { TransitionSequenceItem } from "./sequence-item-transition";
import { Transitions } from "./transitions";
import merge from "lodash.merge";

export const Composition = ({
  design,
  size,
}: {
  design: IDesign;
  size: ISize;
}) => {
  const [handle] = useState(() => delayRender());
  const { fps } = useVideoConfig();
  const currentFrame = useCurrentFrame();

  const fetchData = useCallback(async () => {
    const fonts: IFont[] = [];
    const trackItemsMap = design.trackItemsMap as Record<
      string,
      ITrackItemAndDetails
    >;
    for (const key in trackItemsMap) {
      const trackItem = trackItemsMap[key] as IText;
      if (trackItem.type === "text" || trackItem.type === "caption") {
        fonts.push({
          postScriptName: trackItem.details.fontFamily,
          url: trackItem.details.fontUrl,
        });
      }
    }

    if (fonts.length > 0) {
      const fontPromises = fonts.map((f) =>
        loadFont({
          family: f.postScriptName,
          url: f.url,
        }),
      );
      await Promise.all(fontPromises);
    }

    continueRender(handle);
  }, []);

  const mergedTrackItemsDeatilsMap = merge(
    design.trackItemsMap,
    design.trackItemDetailsMap,
  );
  const groupedItems = groupTrackItems({
    trackItemIds: design.trackItemIds,
    transitionsMap: design.transitionsMap,
    trackItemsMap: mergedTrackItemsDeatilsMap,
  });

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      {groupedItems.map((group, index) => {
        const item = mergedTrackItemsDeatilsMap[group.id];
        if (group.transition) {
          const fromItem = mergedTrackItemsDeatilsMap[group.id];
          const toItem = mergedTrackItemsDeatilsMap[group.transition.toId];
          const transition =
            Transitions[group.transition.kind as keyof typeof Transitions];

          // Only render if we have all required pieces
          if (fromItem && toItem && transition) {
            const from = (fromItem.display.from / 1000) * fps;
            const transitionFrames = (group.transition.duration / 1000) * fps;

            const fromTransition = TransitionSequenceItem[fromItem.type](
              fromItem,
              {
                fps,
                transitionFrames: 0,
                currentFrame,
                isFreeze: false,
              },
            );

            const transitionEffect = transition({
              durationInFrames: transitionFrames,
              ...size,
              id: group.transition.id,
              direction: group.transition.direction,
            });

            const toTransition = TransitionSequenceItem[toItem.type](toItem, {
              fps,
              transitionFrames,
              currentFrame,
              isFreeze: true,
              fromX: from,
            });

            return (
              <TransitionSeries from={from} key={index}>
                {fromTransition}
                {transitionEffect}
                {toTransition}
              </TransitionSeries>
            );
          }
        }

        return SequenceItem[item.type](item, {
          fps,
        });
      })}
    </>
  );
};
