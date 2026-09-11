import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

const RSS_URL = "https://freeflowcreativehub.substack.com/feed";

export async function GET() {
  try {
    const response = await fetch(RSS_URL, {
      next: {
        revalidate: 3600, // Cache for 1 hour
      },
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch RSS feed: ${response.status} ${response.statusText}`
      );
    }

    const xml = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      cdataPropName: "__cdata",
      textNodeName: "#text",
      parseTagValue: false,
      trimValues: true,
    });

    const data = parser.parse(xml);

    const items = data?.rss?.channel?.item ?? [];

    const posts = (Array.isArray(items) ? items : [items]).map(
      (item: any) => {
        const title = cleanText(item.title);
        const summary = cleanText(item.description);

        const rawPost =
          typeof item["content:encoded"] === "object"
            ? item["content:encoded"]?.__cdata ??
              item["content:encoded"]?.["#text"] ??
              ""
            : item["content:encoded"] ?? "";

        const post = removeImages(rawPost);

        const image =
          item.enclosure?.["@_url"] ??
          extractFirstImage(rawPost) ??
          null;

        const pubDate = item.pubDate
          ? new Date(item.pubDate)
          : null;

        return {
          title,
          summary,
          post,
          image,
          date: pubDate ? formatDate(pubDate) : null,
          time: pubDate ? formatTime(pubDate) : null,
          publishedAt: pubDate?.toISOString() ?? null,
          url: item.link ?? null,
          author: cleanText(item["dc:creator"]),
        };
      }
    );

    return NextResponse.json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Blog RSS error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to retrieve blog posts",
      },
      { status: 500 }
    );
  }
}

/**
 * Remove images from the article HTML.
 *
 * This removes:
 * - <img>
 * - <picture>
 * - <figure> containing images
 * - Substack image containers
 */
function removeImages(html: string): string {
  if (!html) return "";

  return html
    .replace(
      /<div[^>]*class=["'][^"']*captioned-image-container[^"']*["'][^>]*>[\s\S]*?<\/div>\s*<\/div>/gi,
      ""
    )
    .replace(/<picture[\s\S]*?<\/picture>/gi, "")
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/<figure[\s\S]*?<\/figure>/gi, "")
    .trim();
}

/**
 * Get the first image from the article if the RSS
 * enclosure is unavailable.
 */
function extractFirstImage(html: string): string | null {
  if (!html) return null;

  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);

  return match?.[1] ?? null;
}

/**
 * Convert RSS title/description/CDATA to clean text.
 */
function cleanText(value: any): string {
  if (!value) return "";

  const text =
    typeof value === "object"
      ? value.__cdata ?? value["#text"] ?? ""
      : String(value);

  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Format date in a readable form.
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(date);
}

/**
 * Format publication time.
 */
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Lagos",
  }).format(date);
}