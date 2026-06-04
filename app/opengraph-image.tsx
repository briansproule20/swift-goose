import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Saltworks — encoding, hashing, encryption";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Pull a TTF/OTF of Fraunces from Google Fonts (Satori can't use woff2). */
async function loadFraunces(): Promise<ArrayBuffer | undefined> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600",
    ).then((r) => r.text());
    const url =
      css.match(
        /src:\s*url\((https:[^)]+)\)\s*format\(['"]?(?:truetype|opentype)['"]?\)/,
      )?.[1] ?? css.match(/url\((https:[^)]+\.(?:ttf|otf))\)/)?.[1];
    if (!url) return undefined;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return undefined;
  }
}

export default async function OgImage() {
  const [cubeBuf, fraunces] = await Promise.all([
    readFile(join(process.cwd(), "public/salt-cube.png")),
    loadFraunces(),
  ]);
  const cube = `data:image/png;base64,${cubeBuf.toString("base64")}`;
  const display = fraunces ? "Fraunces" : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 64,
          backgroundColor: "#1f1c18",
          backgroundImage:
            "radial-gradient(70% 70% at 30% 0%, rgba(79,122,230,0.22), transparent 65%)",
          color: "#ece7dd",
          padding: 80,
        }}
      >
        <img
          src={cube}
          width={300}
          height={300}
          alt=""
          style={{
            borderRadius: 26,
            boxShadow: "0 40px 120px rgba(79,122,230,0.35)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontFamily: display,
              fontSize: 132,
              lineHeight: 1,
              letterSpacing: -4,
            }}
          >
            <span style={{ color: "#ece7dd" }}>Salt</span>
            <span style={{ color: "#8c8579" }}>works</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", marginTop: 30 }}>
            <span style={{ height: 2, width: 72, backgroundColor: "#6f95f0", marginBottom: 18 }} />
            <span
              style={{
                fontSize: 24,
                letterSpacing: 6,
                color: "#9db8f5",
                textTransform: "uppercase",
              }}
            >
              encoding · hashing · encryption
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      ...(fraunces
        ? { fonts: [{ name: "Fraunces", data: fraunces, weight: 600 as const, style: "normal" as const }] }
        : {}),
    },
  );
}
