import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Entranced Beauty",
    short_name: "Entranced",
    description: "Book nails, makeup and hair with Entranced Beauty in Windhoek.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF9F8",
    theme_color: "#DD7981",
  };
}
