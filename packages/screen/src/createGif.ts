import { logger } from "@qawolf/logger";
import { spawn } from "child_process";
import { getPath } from "./ffmpeg";
import { Size } from "./types";

type CreateGifOptions = {
  gifPath: string;
  size: Size;
  videoPath: string;
};

export const createGif = (options: CreateGifOptions) => {
  logger.verbose(
    `createGif: creating for ${options.videoPath} -> ${options.gifPath}`
  );

  return new Promise(resolve => {
    const ffmpegPath = getPath();

    const shrunkHeight = Math.min(options.size.height, 640);

    const ffmpeg = spawn("sh", [
      "-c",
      // https://askubuntu.com/a/837574/856776
      `${ffmpegPath} -i ${options.videoPath} -vf "fps=10,scale=${shrunkHeight}:-1:flags=lanczos,setpts=0.5*PTS" ${options.gifPath}`
    ]);

    ffmpeg.on("close", () => {
      logger.verbose("createGif: done");
      resolve();
    });

    ffmpeg.stdout.on("data", function(data) {
      logger.debug(`ffmpeg: ${data.toString()}`);
    });

    ffmpeg.stderr.on("data", function(data) {
      logger.debug(`ffmpeg: ${data.toString()}`);
    });
  });
};
