import * as React from 'react';
import createEmotionServer from '@emotion/server/create-instance';
import createEmotionCache from './emotionCache';

export function extractCriticalToChunks(html: string) {
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);
  return extractCriticalToChunks(html);
}

export function constructStyleTagsFromChunks(chunks: any) {
  return chunks.styles.map((style: any) => (
    <style
      key={style.key}
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));
}
