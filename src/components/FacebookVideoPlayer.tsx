"use client";

import React from "react";

interface FacebookVideoPlayerProps {
  url: string;
}

export default function FacebookVideoPlayer({ url }: FacebookVideoPlayerProps) {
  if (!url) {
    return (
      <div className="w-full h-full min-h-[220px] md:min-h-[360px] rounded-3xl flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold">
        <span>ভিডিও সেট করা নেই</span>
      </div>
    );
  }

  // Properly encode the URL for the iframe
  const encodedUrl = encodeURIComponent(url);
  const iframeSrc = `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=auto`;

  return (
    <div className="w-full h-full min-h-[220px] md:min-h-[360px] rounded-3xl overflow-hidden shadow border border-zinc-200/50 dark:border-zinc-800/80 bg-black flex items-center justify-center relative">
      <iframe
        src={iframeSrc}
        width="100%"
        height="100%"
        style={{ border: "none", overflow: "hidden", minHeight: "360px" }}
        scrolling="no"
        frameBorder="0"
        allowFullScreen={true}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
