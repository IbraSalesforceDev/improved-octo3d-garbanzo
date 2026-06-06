import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

// Imagen que se muestra al compartir el enlace (WhatsApp, redes, etc.).
export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 90,
          background:
            "linear-gradient(135deg, #eef2ff 0%, #ffffff 45%, #fdf4ff 100%)",
        }}
      >
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: 28,
            background: "#4f46e5",
            color: "white",
            fontSize: 64,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {site.name.charAt(0)}
        </div>
        <div
          style={{
            marginTop: 44,
            fontSize: 84,
            fontWeight: 700,
            color: "#111827",
          }}
        >
          {site.name}
        </div>
        <div style={{ marginTop: 14, fontSize: 38, color: "#4b5563" }}>
          {site.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
