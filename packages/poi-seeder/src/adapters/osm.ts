import type { OSMFeature, POIAdapter, SourcePOI } from "../types.js";

// const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";
const OVERPASS_API_URL = " 	https://maps.mail.ru/osm/tools/overpass/api/interpreter";

/**
 * Adapter for OpenStreetMap data (Overpass API or exported GeoJSON)
 */
export class OSMAdapter implements POIAdapter {
  /**
   * Fetch POIs from Overpass API using an Overpass QL query
   */
  async fetch(overpassQuery: string): Promise<SourcePOI[]> {
    console.log("🌍 Querying Overpass API...");
    console.log("Query:", overpassQuery);
    
    const response = await fetch(OVERPASS_API_URL, {
      method: "POST",
      body: overpassQuery,
      headers: {
        "Content-Type": "text/plain",
      },
    });

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✓ Received ${data.elements?.length || 0} elements from Overpass\n`);
    
    return this.parse(data);
  }

  validate(input: unknown): boolean {
    if (!input || typeof input !== "object") return false;
    const data = input as any;
    
    // Check for Overpass API response format
    if (data.elements && Array.isArray(data.elements)) return true;
    
    // Check for OSM XML converted to JSON
    if (data.osm && Array.isArray(data.osm.node)) return true;
    
    return false;
  }

  async parse(input: unknown): Promise<SourcePOI[]> {
    const data = input as any;
    const features: OSMFeature[] = [];

    // Handle Overpass API JSON format
    if (data.elements) {
      features.push(...data.elements);
    }
    
    // Handle OSM XML -> JSON format (if needed)
    if (data.osm?.node) {
      features.push(...data.osm.node.map((n: any) => ({
        type: "node" as const,
        id: n.$.id,
        lat: Number.parseFloat(n.$.lat),
        lon: Number.parseFloat(n.$.lon),
        tags: this.parseTags(n.tag),
      })));
    }

    return features
      .map(f => this.convertOSMFeature(f))
      .filter((poi): poi is SourcePOI => poi !== null);
  }

  private parseTags(tagArray: any[]): Record<string, string> {
    if (!Array.isArray(tagArray)) return {};
    return tagArray.reduce((acc, tag) => {
      if (tag.$?.k && tag.$.v) {
        acc[tag.$.k] = tag.$.v;
      }
      return acc;
    }, {} as Record<string, string>);
  }

  private convertOSMFeature(feature: OSMFeature): SourcePOI | null {
    const tags = feature.tags || {};
    
    // Determine coordinates
    let lat: number | undefined;
    let lon: number | undefined;
    
    if (feature.type === "node" && feature.lat && feature.lon) {
      lat = feature.lat;
      lon = feature.lon;
    } else if (feature.center) {
      lat = feature.center.lat;
      lon = feature.center.lon;
    }
    
    if (!lat || !lon) return null; // Skip features without coordinates
    
    // Extract name
    const name = tags.name || tags["name:en"] || `OSM ${feature.type} ${feature.id}`;
    
    // Extract category from OSM tags
    const category = this.inferCategory(tags);
    
    // Build description from tags
    const description = this.buildDescription(tags);
    
    return {
      name,
      description,
      latitude: lat,
      longitude: lon,
      category,
      tags,
      sourceId: `osm:${feature.type}:${feature.id}`,
      sourceType: "osm",
      address: tags["addr:full"] || this.buildAddress(tags),
      website: tags.website || tags.url,
      phone: tags.phone || tags["contact:phone"],
    };
  }

  private inferCategory(tags: Record<string, string>): string | undefined {
    // Map OSM tags to our category system
    // This is a simple mapping - you'll want to expand this
    if (tags.amenity) {
      const amenityMap: Record<string, string> = {
        restaurant: "restaurant",
        cafe: "cafe",
        bar: "bar",
        pub: "bar",
        hospital: "hospital",
        pharmacy: "pharmacy",
        police: "police",
        fuel: "gas_station",
        parking: "parking",
        bank: "bank",
        atm: "atm",
        post_office: "post_office",
        library: "library",
        school: "school",
        university: "university",
      };
      return amenityMap[tags.amenity];
    }
    
    if (tags.tourism) {
      const tourismMap: Record<string, string> = {
        hotel: "hotel",
        hostel: "hotel",
        museum: "museum",
        attraction: "attraction",
        viewpoint: "viewpoint",
      };
      return tourismMap[tags.tourism];
    }
    
    if (tags.shop) return "shop";
    
    return undefined;
  }

  private buildDescription(tags: Record<string, string>): string | undefined {
    const parts: string[] = [];
    
    if (tags.description) parts.push(tags.description);
    if (tags.amenity) parts.push(`Type: ${tags.amenity}`);
    if (tags.cuisine) parts.push(`Cuisine: ${tags.cuisine}`);
    if (tags.opening_hours) parts.push(`Hours: ${tags.opening_hours}`);
    
    return parts.length > 0 ? parts.join(" | ") : undefined;
  }

  private buildAddress(tags: Record<string, string>): string | undefined {
    const parts: string[] = [];
    
    if (tags["addr:housenumber"]) parts.push(tags["addr:housenumber"]);
    if (tags["addr:street"]) parts.push(tags["addr:street"]);
    if (tags["addr:city"]) parts.push(tags["addr:city"]);
    if (tags["addr:postcode"]) parts.push(tags["addr:postcode"]);
    if (tags["addr:country"]) parts.push(tags["addr:country"]);
    
    return parts.length > 0 ? parts.join(", ") : undefined;
  }
}
