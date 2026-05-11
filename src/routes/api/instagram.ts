import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// Public Instagram profile feed for @_melanin._.hair_
// Uses Instagram's public web_profile_info endpoint (no auth required for public accounts).
// - Validates and normalizes payload with Zod.
// - HEAD-checks each media URL in parallel and drops any that don't return image/video.
// - Caller falls back to gallery_items / local images when items[] is empty.
const USERNAME = "_melanin._.hair_";

const ItemSchema = z.object({
  id: z.string().min(1).max(64),
  media_url: z.string().url().max(2048),
  thumbnail_url: z.string().url().max(2048),
  caption: z.string().max(4000).default(""),
  permalink: z.string().url().max(512),
  media_type: z.enum(["image", "video"]),
});
type StudioItem = z.infer<typeof ItemSchema>;

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
  const edges = json?.data?.user?.edge_owner_to_timeline_media?.edges ?? [];

  const raw = edges.slice(0, 18).map((e: any) => {
    const n = e?.node ?? {};
    return {
      id: String(n.id ?? ""),
      media_url: String(n.display_url ?? ""),
      thumbnail_url: String(n.thumbnail_src ?? n.display_url ?? ""),
      caption: String(n.edge_media_to_caption?.edges?.[0]?.node?.text ?? ""),
      permalink: n.shortcode ? `https://www.instagram.com/p/${n.shortcode}/` : "",
      media_type: n.is_video ? "video" : "image",
    };
  });

  // Validate each item; drop invalid entries instead of failing the whole feed.
  return raw.flatMap((r: unknown) => {
    const parsed = ItemSchema.safeParse(r);
    return parsed.success ? [parsed.data] : [];
  });
}

// HEAD-check a URL with a short timeout. Returns true if it resolves to a usable
// image/video response. Instagram CDN URLs expire (oe= timestamp) so this
// catches stale / 403 / 410 responses before the client renders broken tiles.
async function isReachable(url: string): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 3500);
  try {
    let res = await fetch(url, { method: "HEAD", signal: ctrl.signal, redirect: "follow" });
    // Some CDNs reject HEAD; retry with a tiny GET.
    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        signal: ctrl.signal,
        redirect: "follow",
      });
    }
    if (!res.ok && res.status !== 206) return false;
    const ct = res.headers.get("content-type") ?? "";
    return ct.startsWith("image/") || ct.startsWith("video/") || ct === "";
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function filterReachable(items: StudioItem[]): Promise<StudioItem[]> {
  const checks = await Promise.all(items.map((it) => isReachable(it.media_url)));
  return items.filter((_, i) => checks[i]);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/instagram")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: corsHeaders }),
      GET: async () => {
        try {
          const all = await fetchInstagram();
          const reachable = await filterReachable(all);
          const items = reachable.slice(0, 12);
          return Response.json(
            {
              source: "instagram",
              username: USERNAME,
              items,
              dropped: all.length - reachable.length,
            },
            {
              headers: {
                "Cache-Control": "public, max-age=600, s-maxage=600",
                ...corsHeaders,
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
            { status: 200, headers: corsHeaders }
          );
        }
      },
    },
  },
});
