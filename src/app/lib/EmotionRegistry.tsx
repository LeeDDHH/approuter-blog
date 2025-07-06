'use client';

import { CacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';
import * as React from 'react';

import createEmotionCache from '@/app/utils/createEmotionCache';

interface Props {
  children: React.ReactNode;
}

export default function EmotionRegistry({ children }: Props) {
  const [emotionCache] = React.useState(() => createEmotionCache());

  useServerInsertedHTML(() => {
    if (!emotionCache) return null;

    return (
      <style
        data-emotion={`${emotionCache.key} ${Object.keys(emotionCache.inserted).join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: Object.values(emotionCache.inserted).join(' '),
        }}
      />
    );
  });

  return <CacheProvider value={emotionCache}>{children}</CacheProvider>;
}