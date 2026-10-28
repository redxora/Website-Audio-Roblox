import { Buffer } from "node:buffer";

const TYPE_MAPPING = {
  3: { typeName: "Audio", ext: "mp3", contentType: "audio/mpeg" },
  24: { typeName: "Animation", ext: "rbxm", contentType: "application/octet-stream" },
  61: { typeName: "Emote", ext: "rbxm", contentType: "application/octet-stream" },
  1: { typeName: "Image", ext: "png", contentType: "image/png" },
  13: { typeName: "Decal", ext: "png", contentType: "image/png" },
  10: { typeName: "Model", ext: "rbxm", contentType: "application/octet-stream" },
};

function formatSize(bytes) {
  const kb = bytes / 1024;
  if (kb >= 1024) return `${(kb / 1024).toFixed(2)} MB`;
  return `${kb.toFixed(2)} KB`;
}

export function extractRobloxAssetIds(rawInput) {
  if (!rawInput) return [];
  const results = [];

  const urlRegex = /(?:library|catalog|asset|assets)\/(\d+)|[?&]id=(\d+)/gi;
  let urlMatch;
  while ((urlMatch = urlRegex.exec(rawInput)) !== null) {
    const id = urlMatch[1] || urlMatch[2];
    if (id) results.push(id);
  }

  if (results.length > 0) {
    return Array.from(new Set(results));
  }

  const tokens = rawInput.split(/[\s,;|]+/);
  for (const token of tokens) {
    const match = token.match(/\d{4,}/);
    if (match) {
      results.push(match[0]);
    }
  }

  return Array.from(new Set(results));
}

export async function fetchRobloxAsset(assetId) {
  const cleanId = String(assetId).replace(/\D/g, "");
  if (!cleanId) return null;

  let detailsData = null;
  let toolboxItem = null;

  await Promise.allSettled([
    (async () => {
      try {
        const res = await fetch(`https://economy.roblox.com/v2/assets/${cleanId}/details`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) detailsData = await res.json();
      } catch { }
    })(),
    (async () => {
      try {
        const res = await fetch(`https://apis.roblox.com/toolbox-service/v1/items/details?assetIds=${cleanId}`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const d = await res.json();
          toolboxItem = d?.data?.[0];
        }
      } catch { }
    })(),
  ]);

  if (!detailsData && !toolboxItem) {
    return null;
  }

  const typeId = detailsData?.TypeId || toolboxItem?.asset?.typeId || 3;
  const mapping = TYPE_MAPPING[typeId] || { typeName: "Audio", ext: "mp3", contentType: "audio/mpeg" };
  const rawTitle = detailsData?.Name || toolboxItem?.asset?.name || `Roblox Asset ${cleanId}`;
  const sanitizedTitle = rawTitle.replace(/[\\/:*?"<>|]/g, "_").trim() || `Asset_${cleanId}`;
  const fileName = `${sanitizedTitle}.${mapping.ext}`;

  const creatorName = detailsData?.Creator?.Name || toolboxItem?.creator?.name || "Roblox Creator";
  const creatorId = String(detailsData?.Creator?.Id || toolboxItem?.creator?.id || cleanId);
  const description = detailsData?.Description || toolboxItem?.asset?.description || "Asset Roblox";

  let fileBuffer = null;
  try {
    const deliveryRes = await fetch(`https://assetdelivery.roblox.com/v1/asset/?id=${cleanId}`, {
      headers: {
        "User-Agent": "Roblox/WinInet",
        Accept: "*/*",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (deliveryRes.ok) {
      const arrayBuf = await deliveryRes.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuf);
    }
  } catch { }

  if (!fileBuffer || fileBuffer.length === 0) {
    fileBuffer = Buffer.from(`Asset ${cleanId} - ${rawTitle}\nDownloaded via Cilaaa Community`);
  }

  return {
    id: cleanId,
    title: rawTitle,
    name: sanitizedTitle,
    typeName: mapping.typeName,
    ext: mapping.ext,
    contentType: mapping.contentType,
    fileName,
    creatorName,
    creatorId,
    description,
    fileBuffer,
    fileSizeFormatted: formatSize(fileBuffer.length),
  };
}
