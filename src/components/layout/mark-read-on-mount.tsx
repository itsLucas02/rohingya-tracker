"use client";

import { useEffect } from "react";
import { markNotificationsRead } from "@/lib/actions/notifications";

export function MarkReadOnMount() {
  useEffect(() => {
    markNotificationsRead();
  }, []);
  return null;
}
