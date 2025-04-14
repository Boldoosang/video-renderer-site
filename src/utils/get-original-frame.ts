import { ITrackItem } from "@designcombo/types";

export const getOriginalVideoFrame = (
  globalFps: number,
  globalFrame: number,
  videoAsset: any,
  startFrame: number,
  item: ITrackItem,
): number | null => {
  const videoFps = videoAsset.details.fps ?? 30;
  const globalTimeMs = (globalFrame / globalFps) * 1000;

  const overlap = Math.max(
    0,
    Math.min(videoAsset.display.to, item.display.to) -
      Math.max(startFrame, item.display.from),
  );
  if (overlap <= 0) {
    return null;
  }

  if (globalTimeMs < videoAsset.display.from) {
    return Math.max(
      Math.floor((videoAsset.trim.from / 1000) * videoFps),
      startFrame,
    );
  }

  if (globalTimeMs >= videoAsset.display.to) {
    return Math.floor((videoAsset.trim.to / 1000) * videoFps);
  }

  const playbackRate = videoAsset.playbackRate ?? 1;
  const originalVideoTimeMs =
    (globalTimeMs - videoAsset.display.from) * playbackRate +
    videoAsset.trim.from;
  const videoFrame = Math.floor((originalVideoTimeMs / 1000) * videoFps);

  return Math.max(videoFrame, startFrame);
};
