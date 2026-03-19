import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "BellaMD — Beautiful Markdown Editing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const iconData = await readFile(join(process.cwd(), "public", "icon.png"));
  const iconBase64 = `data:image/png;base64,${iconData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0c1421 0%, #162032 50%, #0c1421 100%)",
          position: "relative",
        }}
      >
        {/* Subtle accent glow */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-100px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-50px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "32px",
          }}
        >
          {/* Icon */}
          <img
            src={iconBase64}
            width={120}
            height={120}
            style={{ borderRadius: "24px" }}
          />

          {/* App name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#edf2f7",
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            BellaMD
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              color: "#8ba4bf",
              display: "flex",
            }}
          >
            Beautiful Markdown Editing
          </div>

          {/* Accent divider */}
          <div
            style={{
              width: "80px",
              height: "3px",
              background: "linear-gradient(90deg, #0EA5E9, #38bdf8)",
              borderRadius: "2px",
              display: "flex",
            }}
          />

          {/* Platforms */}
          <div
            style={{
              fontSize: 18,
              color: "#64748b",
              display: "flex",
              gap: "24px",
            }}
          >
            <span style={{ display: "flex" }}>macOS</span>
            <span style={{ display: "flex" }}>Windows</span>
            <span style={{ display: "flex" }}>Linux</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
