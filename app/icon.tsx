import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      background: "#001c52",
      color: "#ffffff",
      fontSize: 31,
      fontWeight: 900,
      letterSpacing: -3,
    }}>
      <span>L</span><span style={{ color: "#ffd02f" }}>S</span>
    </div>,
    size,
  );
}
