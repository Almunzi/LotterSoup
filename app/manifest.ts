import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/app",
    name: "The LotterySoup",
    short_name: "LotterySoup",
    description: "Your weekly LotterySoup subscriber update.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#001c52",
    theme_color: "#001c52",
    orientation: "portrait-primary",
    icons: [
      { src: "/app-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
