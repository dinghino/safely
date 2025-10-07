/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as devices_get from "../devices/get.js";
import type * as devices_heartbeat from "../devices/heartbeat.js";
import type * as devices_location from "../devices/location.js";
import type * as devices_manage from "../devices/manage.js";
import type * as geospatial from "../geospatial.js";
import type * as http from "../http.js";
import type * as lib_auth_index from "../lib/auth/index.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_devices_get from "../lib/devices/get.js";
import type * as lib_devices_heartbeat from "../lib/devices/heartbeat.js";
import type * as lib_devices_index from "../lib/devices/index.js";
import type * as lib_devices_options from "../lib/devices/options.js";
import type * as presence from "../presence.js";
import type * as privateData from "../privateData.js";
import type * as schemas_enums from "../schemas/enums.js";
import type * as schemas_index from "../schemas/index.js";
import type * as seed from "../seed.js";
import type * as seeds_devices from "../seeds/devices.js";
import type * as settings from "../settings.js";
import type * as system from "../system.js";
import type * as todos from "../todos.js";
import type * as tracking_lib from "../tracking/lib.js";
import type * as tracking_locations from "../tracking/locations.js";
import type * as tracking_requests from "../tracking/requests.js";
import type * as tracking_sessions from "../tracking/sessions.js";
import type * as users_clerk from "../users/clerk.js";
import type * as users_get from "../users/get.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "devices/get": typeof devices_get;
  "devices/heartbeat": typeof devices_heartbeat;
  "devices/location": typeof devices_location;
  "devices/manage": typeof devices_manage;
  geospatial: typeof geospatial;
  http: typeof http;
  "lib/auth/index": typeof lib_auth_index;
  "lib/constants": typeof lib_constants;
  "lib/devices/get": typeof lib_devices_get;
  "lib/devices/heartbeat": typeof lib_devices_heartbeat;
  "lib/devices/index": typeof lib_devices_index;
  "lib/devices/options": typeof lib_devices_options;
  presence: typeof presence;
  privateData: typeof privateData;
  "schemas/enums": typeof schemas_enums;
  "schemas/index": typeof schemas_index;
  seed: typeof seed;
  "seeds/devices": typeof seeds_devices;
  settings: typeof settings;
  system: typeof system;
  todos: typeof todos;
  "tracking/lib": typeof tracking_lib;
  "tracking/locations": typeof tracking_locations;
  "tracking/requests": typeof tracking_requests;
  "tracking/sessions": typeof tracking_sessions;
  "users/clerk": typeof users_clerk;
  "users/get": typeof users_get;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  geospatial: {
    document: {
      get: FunctionReference<
        "query",
        "internal",
        { key: string },
        {
          coordinates: { latitude: number; longitude: number };
          filterKeys: Record<
            string,
            | string
            | number
            | boolean
            | null
            | bigint
            | Array<string | number | boolean | null | bigint>
          >;
          key: string;
          sortKey: number;
        } | null
      >;
      insert: FunctionReference<
        "mutation",
        "internal",
        {
          document: {
            coordinates: { latitude: number; longitude: number };
            filterKeys: Record<
              string,
              | string
              | number
              | boolean
              | null
              | bigint
              | Array<string | number | boolean | null | bigint>
            >;
            key: string;
            sortKey: number;
          };
          levelMod: number;
          maxCells: number;
          maxLevel: number;
          minLevel: number;
        },
        null
      >;
      remove: FunctionReference<
        "mutation",
        "internal",
        {
          key: string;
          levelMod: number;
          maxCells: number;
          maxLevel: number;
          minLevel: number;
        },
        boolean
      >;
    };
    query: {
      debugCells: FunctionReference<
        "query",
        "internal",
        {
          levelMod: number;
          maxCells: number;
          maxLevel: number;
          minLevel: number;
          rectangle: {
            east: number;
            north: number;
            south: number;
            west: number;
          };
        },
        Array<{
          token: string;
          vertices: Array<{ latitude: number; longitude: number }>;
        }>
      >;
      execute: FunctionReference<
        "query",
        "internal",
        {
          cursor?: string;
          levelMod: number;
          logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
          maxCells: number;
          maxLevel: number;
          minLevel: number;
          query: {
            filtering: Array<{
              filterKey: string;
              filterValue: string | number | boolean | null | bigint;
              occur: "should" | "must";
            }>;
            maxResults: number;
            rectangle: {
              east: number;
              north: number;
              south: number;
              west: number;
            };
            sorting: {
              interval: { endExclusive?: number; startInclusive?: number };
            };
          };
        },
        {
          nextCursor?: string;
          results: Array<{
            coordinates: { latitude: number; longitude: number };
            key: string;
          }>;
        }
      >;
      nearestPoints: FunctionReference<
        "query",
        "internal",
        {
          levelMod: number;
          logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
          maxDistance?: number;
          maxLevel: number;
          maxResults: number;
          minLevel: number;
          nextCursor?: string;
          point: { latitude: number; longitude: number };
        },
        Array<{
          coordinates: { latitude: number; longitude: number };
          distance: number;
          key: string;
        }>
      >;
    };
  };
  presence: {
    public: {
      disconnect: FunctionReference<
        "mutation",
        "internal",
        { sessionToken: string },
        null
      >;
      heartbeat: FunctionReference<
        "mutation",
        "internal",
        {
          interval?: number;
          roomId: string;
          sessionId: string;
          userId: string;
        },
        { roomToken: string; sessionToken: string }
      >;
      list: FunctionReference<
        "query",
        "internal",
        { limit?: number; roomToken: string },
        Array<{ lastDisconnected: number; online: boolean; userId: string }>
      >;
      listRoom: FunctionReference<
        "query",
        "internal",
        { limit?: number; onlineOnly?: boolean; roomId: string },
        Array<{ lastDisconnected: number; online: boolean; userId: string }>
      >;
      listUser: FunctionReference<
        "query",
        "internal",
        { limit?: number; onlineOnly?: boolean; userId: string },
        Array<{ lastDisconnected: number; online: boolean; roomId: string }>
      >;
      removeRoom: FunctionReference<
        "mutation",
        "internal",
        { roomId: string },
        null
      >;
      removeRoomUser: FunctionReference<
        "mutation",
        "internal",
        { roomId: string; userId: string },
        null
      >;
    };
  };
};
