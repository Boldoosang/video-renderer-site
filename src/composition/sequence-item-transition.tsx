import { AbsoluteFill, Audio, Img, OffthreadVideo, Freeze } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import MediaBackground from "./media-background";
import {
  IAudio,
  IImage,
  IItem,
  IText,
  ITrackItem,
  ITransition,
  IVideo,
} from "@designcombo/types";
import { calculateFrames } from "../utils/frames";

interface IAnimation {
  idObject: string;
  type: string;
}

interface SequenceItemOptions {
  handleTextChange?: (id: string, text: string) => void;
  fps: number;
  animations?: IAnimation[];
  editableTextId?: string | null;
  containTransition?: ITransition;
  transitionFrames?: number;
  currentFrame: number;
  isFreeze?: boolean;
  fromX?: number;
}

export const TransitionSequenceItem: Record<
  string,
  (item: IItem, options: SequenceItemOptions) => JSX.Element
> = {
  text: (item: ITrackItem, options: SequenceItemOptions) => {
    const { details } = item as IText;
    const { fps } = options;
    const { durationInFrames } = calculateFrames(item.display, fps);
    const boxShadowAsShadow = details.boxShadow
      ? `${details.boxShadow.x}px ${details.boxShadow.y}px ${details.boxShadow.blur}px ${details.boxShadow.color}`
      : "";

    return (
      <TransitionSeries.Sequence
        key={item.id}
        durationInFrames={durationInFrames}
        style={{
          position: "absolute",
          width: details.width || 300,
          height: details.height || 400,
          transform: details.transform || "none",
          fontSize: details.fontSize || "16px",
          textAlign: details.textAlign || "left",
          top: details.top || 300,
          left: details.left || 600,
          color: details.color || "#000000",
          backgroundColor: details.backgroundColor || "transparent",
          border: details.border || "none",
          opacity: details.opacity! / 100,
          fontFamily: details.fontFamily || "Arial",
          fontWeight: details.fontWeight || "normal",
          lineHeight: details.lineHeight || "normal",
          letterSpacing: details.letterSpacing || "normal",
          wordSpacing: details.wordSpacing || "normal",
          wordWrap: details.wordWrap || "",
          wordBreak: details.wordBreak || "normal",
          pointerEvents: "auto",
          textTransform: details.textTransform || "none",
        }}
      >
        <AbsoluteFill
          className={`designcombo-scene-item id-${item.id} designcombo-scene-item-type-${item.type}`}
        >
          <div
            style={{
              pointerEvents: "none",
              width: "100%",
              whiteSpace: "normal",
              position: "relative",
              textDecoration: details.textDecoration || "none",
              WebkitTextStroke: `${details.borderWidth}px ${details.borderColor}`, // Outline/stroke color and thickness
              paintOrder: "stroke fill", // Order of painting
              textShadow: boxShadowAsShadow,
            }}
          >
            {details.text}
          </div>
        </AbsoluteFill>
      </TransitionSeries.Sequence>
    );
  },
  image: (item: ITrackItem, options: SequenceItemOptions) => {
    const { fps, containTransition } = options;
    const { details } = item as IImage;
    const { durationInFrames } = calculateFrames(item.display, fps);
    const crop = details?.crop || {
      x: 0,
      y: 0,
      width: details.width,
      height: details.height,
    };
    const boxShadowAsOutline = `0 0 0 ${details.borderWidth}px ${details.borderColor}`;
    const boxShadowAsShadow = details.boxShadow
      ? `${details.boxShadow.x}px ${details.boxShadow.y}px ${details.boxShadow.blur}px ${details.boxShadow.color}`
      : "";
    let extraTime = 0;
    if (containTransition) {
      const { durationInFrames } = calculateFrames(
        { from: 0, to: containTransition.duration },
        fps,
      );
      extraTime = durationInFrames;
    }

    return (
      <TransitionSeries.Sequence
        key={item.id}
        durationInFrames={durationInFrames + extraTime / 2}
        style={{
          pointerEvents: "auto",
        }}
      >
        {item.isMain && (
          <MediaBackground
            key={item.id + "background"}
            background={details.background}
          />
        )}
        <AbsoluteFill
          data-track-item="transition-element"
          className={`designcombo-scene-item id-${item.id} designcombo-scene-item-type-${item.type}`}
          style={{
            pointerEvents: "auto",
            top: details?.top || 0,
            left: details?.left || 0,
            width: crop.width || "100%", // Default width
            height: crop.height || "auto", // Default height
            transform: details.transform || "none",
            opacity: details?.opacity !== undefined ? details.opacity / 100 : 1,
            borderRadius: `${Math.min(crop.width, crop.height) * ((details.borderRadius || 0) / 100)}px`, // Default border radius
            boxShadow:
              boxShadowAsOutline +
              (boxShadowAsShadow ? ", " + boxShadowAsShadow : ""), // Default box shadow
            overflow: "hidden",
            transformOrigin: details.transformOrigin || "center center",
            filter: `brightness(${details.brightness}%) blur(${details.blur}px)`,
            rotate: details.rotate || "0deg",
          }}
        >
          <div
            style={{
              width: details.width || "100%", // Default width
              height: details.height || "auto", // Default height
              position: "relative",
              overflow: "hidden",
              pointerEvents: "none",
              scale: `${details.flipX ? "-1" : "1"} ${
                details.flipY ? "-1" : "1"
              }`,
            }}
          >
            <Img
              style={{
                pointerEvents: "none",
                top: -crop.y || 0,
                left: -crop.x || 0,
                width: details.width || "100%", // Default width
                height: details.height || "auto", // Default height
                position: "absolute",
              }}
              data-id={item.id}
              src={details.src}
            />
          </div>
        </AbsoluteFill>
      </TransitionSeries.Sequence>
    );
  },
  video: (item: ITrackItem, options: SequenceItemOptions) => {
    const { fps, transitionFrames, isFreeze, fromX } = options;
    const { details } = item as IVideo;
    const playbackRate = item.playbackRate || 1;
    const { durationInFrames } = calculateFrames(
      {
        from: item.display.from / playbackRate,
        to: item.display.to / playbackRate,
      },
      fps,
    );
    const crop = details.crop || {
      x: 0,
      y: 0,
      width: details.width,
      height: details.height,
    };
    const boxShadowAsOutline = `0 0 0 ${details.borderWidth}px ${details.borderColor}`;
    const boxShadowAsShadow = details.boxShadow
      ? `${details.boxShadow.x}px ${details.boxShadow.y}px ${details.boxShadow.blur}px ${details.boxShadow.color}`
      : "";

    return (
      <TransitionSeries.Sequence
        key={item.id}
        durationInFrames={isFreeze ? transitionFrames! + 2 : durationInFrames}
        style={{ pointerEvents: "none" }}
      >
        {item.isMain && (
          <MediaBackground
            key={item.id + "background"}
            background={details.background || "#ffffff"}
          />
        )}
        {isFreeze ? (
          <Freeze frame={fromX!} active={true}>
            <AbsoluteFill
              data-track-item="transition-element"
              className={`designcombo-scene-item id-${item.id} designcombo-scene-item-type-${item.type}`}
              style={{
                pointerEvents: "auto",
                top: details?.top || 0,
                left: details?.left || 0,
                width: crop.width || "100%", // Default width
                height: crop.height || "auto", // Default height
                transform: details?.transform || "none",
                opacity:
                  details?.opacity !== undefined ? details.opacity / 100 : 1,
                borderRadius: `${Math.min(crop.width!, crop.height!) * ((details.borderRadius || 0) / 100)}px`, // Default border radius
                boxShadow:
                  boxShadowAsOutline +
                  (boxShadowAsShadow ? ", " + boxShadowAsShadow : ""), // Default box shadow
                overflow: "hidden",
                transformOrigin: details.transformOrigin || "center center",
                filter: `brightness(${details.brightness}%) blur(${details.blur}px)`,
                rotate: details.rotate || "0deg",
              }}
            >
              <div
                style={{
                  width: details.width || "100%", // Default width
                  height: details.height || "auto", // Default height
                  position: "relative",
                  overflow: "hidden",
                  pointerEvents: "none",
                  scale: `${details.flipX ? "-1" : "1"} ${
                    details.flipY ? "-1" : "1"
                  }`,
                }}
              >
                <OffthreadVideo
                  startFrom={(item.trim?.from! / 1000) * fps}
                  src={details.src}
                  volume={details.volume || 0 / 100}
                  style={{
                    pointerEvents: "none",
                    top: -crop.y || 0,
                    left: -crop.x || 0,
                    width: details.width || "100%", // Default width
                    height: details.height || "auto", // Default height
                    position: "absolute",
                  }}
                />
              </div>
            </AbsoluteFill>
          </Freeze>
        ) : (
          <AbsoluteFill
            data-track-item="transition-element"
            className={`designcombo-scene-item id-${item.id} designcombo-scene-item-type-${item.type}`}
            style={{
              pointerEvents: "auto",
              top: details?.top || 0,
              left: details?.left || 0,
              width: crop.width || "100%", // Default width
              height: crop.height || "auto", // Default height
              transform: details?.transform || "none",
              opacity:
                details?.opacity !== undefined ? details.opacity / 100 : 1,
              borderRadius: `${Math.min(crop.width!, crop.height!) * ((details.borderRadius || 0) / 100)}px`, // Default border radius
              boxShadow:
                boxShadowAsOutline +
                (boxShadowAsShadow ? ", " + boxShadowAsShadow : ""), // Default box shadow
              overflow: "hidden",
              transformOrigin: details.transformOrigin || "center center",
              filter: `brightness(${details.brightness}%) blur(${details.blur}px)`,
              rotate: details.rotate || "0deg",
            }}
          >
            <div
              style={{
                width: details.width || "100%", // Default width
                height: details.height || "auto", // Default height
                position: "relative",
                overflow: "hidden",
                pointerEvents: "none",
                scale: `${details.flipX ? "-1" : "1"} ${
                  details.flipY ? "-1" : "1"
                }`,
              }}
            >
              <OffthreadVideo
                startFrom={(item.trim?.from! / 1000) * fps}
                endAt={(item.trim?.to! / 1000) * fps}
                playbackRate={playbackRate}
                src={details.src}
                volume={details.volume || 0 / 100}
                style={{
                  pointerEvents: "none",
                  top: -crop.y || 0,
                  left: -crop.x || 0,
                  width: details.width || "100%", // Default width
                  height: details.height || "auto", // Default height
                  position: "absolute",
                }}
              />
            </div>
          </AbsoluteFill>
        )}
      </TransitionSeries.Sequence>
    );
  },
  audio: (item: ITrackItem, options: SequenceItemOptions) => {
    const { fps } = options;
    const { details } = item as IAudio;
    const { durationInFrames } = calculateFrames(item.display, fps);
    const trim = item.trim!;
    return (
      <TransitionSeries.Sequence
        className={`designcombo-scene-item id-${item.id} designcombo-scene-item-type-${item.type}`}
        key={item.id}
        durationInFrames={durationInFrames}
        style={{
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        <AbsoluteFill>
          <Audio
            startFrom={(trim.from / 1000) * fps}
            endAt={(trim.to / 1000) * fps}
            src={details.src}
            volume={(details.volume || 0) / 100}
          />
        </AbsoluteFill>
      </TransitionSeries.Sequence>
    );
  },
};
