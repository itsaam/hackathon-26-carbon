import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { getToken } from "../lib/auth";

export default function Index() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const token = await getToken();
      if (!alive) return;
      setTarget(token ? "/dashboard" : "/login");
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!target) return null;
  return <Redirect href={target as any} />;
}

