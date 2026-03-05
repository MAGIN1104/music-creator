"use client";
import * as React from "react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import createEmotionCache from "../utils/emotionCache";

const theme = createTheme();

export default function Providers({ children }: { children: React.ReactNode }) {
  const [{ cache, flush }] = React.useState(() => {
    const emotionCache = createEmotionCache();
    emotionCache.compat = true;

    const prevInsert = emotionCache.insert;
    let inserted: string[] = [];
    emotionCache.insert = (...args: Parameters<typeof prevInsert>) => {
      const serialized = args[1];
      if (emotionCache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };

    const flushInserted = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };

    return { cache: emotionCache, flush: flushInserted };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }

    let styles = "";
    for (const name of names) {
      styles += cache.inserted[name];
    }

    return (
      <style
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
