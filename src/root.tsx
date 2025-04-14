import { Composition } from "remotion";
import { IDesign } from "@designcombo/types";
import { Composition as CoreComposition } from "./composition";
import base from "./data/base.json";
import { FPS, calcMetadata, WIDTH, HEIGHT } from "./utils/calc-metadata";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RenderVideo"
        component={CoreComposition}
        durationInFrames={300}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          design: base as unknown as IDesign,
          size: {
            width: WIDTH,
            height: HEIGHT,
          },
        }}
        calculateMetadata={calcMetadata}
      />
    </>
  );
};
