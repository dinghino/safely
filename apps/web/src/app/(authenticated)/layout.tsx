'use client'
/** @format */

import Loader from "@/components/loader";
import { Authenticated, Unauthenticated } from "convex/react";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Authenticated>{children}</Authenticated>
      <Unauthenticated>
        <Loader />
      </Unauthenticated>
    </>
  );
}
