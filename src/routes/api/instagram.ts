import { createFileRoute } from "@tanstack/react-router";

// Public Instagram profile feed for @_melanin._.hair_
// Uses Instagram's public web_profile_info endpoint (no auth required for public accounts).
// Falls back gracefully if Instagram blocks the request.
const USERNAME = "_melanin._.hair_";

type StudioItem = {
  id: string;
  media_url: string;
  thumbnail_url: string;
  caption: string;
  permalink: string;
  media_type: "image" | "video";
};

async function fetchInstagram(): Promise<StudioItem[]> {
  const res = await fetch(
    `https://i.instagram.com/api/v1/users/web_profile_info/?username=${USERNAME}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        "X-IG-App-ID": "936619743392459",
        Accept: "*/*",
      },
    }
  );
  if (!res.ok) throw new Error(`IG ${res.status}`);
  const json: any = await res.json();
  const edges =
    json?.data?.user?.edge_owner_to_timeline_media?.edges ?? [];
  return edges.slice(0, 12).map((e: any) => {
    const n = e.node;
    return {
      id: n.id,
      media_url: n.display_url,
      thumbnail_url: n.thumbnail_src ?? n.display_url,
      caption: n.edge_media_to_caption?.edges?.[0]?.node?.text ?? "",
      permalink: `https://www.instagram.com/p/${n.shortcode}/`,
      media_type: n.is_video ? "video" : "image",
    } as StudioItem;
  });
}

export const Route = createFileRoute("/api/instagram")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const items = await fetchInstagram();
          return Response.json(
            { source: "instagram", username: USERNAME, items },
            {
              headers: {
                "Cache-Control": "public, max-age=600, s-maxage=600",
              },
            }
          );
        } catch (err) {
          return Response.json(
            {
              source: "fallback",
              username: USERNAME,
              items: [],
              error: (err as Error).message,
            },
            { status: 200 }
          );
        }
      },
    },
  },
});
