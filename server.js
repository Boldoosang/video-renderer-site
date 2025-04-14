const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { bundle } = require("@remotion/bundler");
const { getCompositions, renderMedia } = require("@remotion/renderer");
const { BlobServiceClient } = require("@azure/storage-blob");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME;

app.post("/api/render", async (req, res) => {
  try {
    const { design } = req.body;

    const entry = path.join(process.cwd(), "src", "index.ts");

    console.log("Bundling project...");
    const bundled = await bundle(entry);

    console.log("Getting compositions...");
    const compositions = await getCompositions(bundled, {
      inputProps: { design },
    });

    const composition = compositions.find((c) => c.id === "RenderVideo");

    if (!composition) {
      return res.status(404).send("Composition not found");
    }

    const outputFileName = `video-${Date.now()}.mp4`;
    const outputPath = path.join(process.cwd(), "out", outputFileName);

    console.log("Rendering video...");
    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: { design },
    });

    console.log("Uploading to Azure...");
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING,
    );
    const containerClient =
      blobServiceClient.getContainerClient(CONTAINER_NAME);
    const blockBlobClient = containerClient.getBlockBlobClient(outputFileName);

    const uploadStream = fs.createReadStream(outputPath);
    await blockBlobClient.uploadStream(uploadStream);

    const blobUrl = blockBlobClient.url;
    console.log("Uploaded to Azure:", blobUrl);

    res.json({ success: true, url: blobUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error rendering or uploading video");
  }
});

app.listen(port, () => {
  console.log(`Remotion render server running at http://localhost:${port}`);
});
