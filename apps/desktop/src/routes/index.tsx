import { Suspense, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import { AuthShowcase } from "~/components/auth-showcase";
import { CreatePostForm, PostCardSkeleton, PostList } from "~/components/posts";

const Home = () => {
  const [chunks, setChunks] = useState(new Uint8Array());
  useEffect(() => {
    void invoke("init_presence").then(() => {
      return invoke("update_presence", {
        status: { state: "Korino", details: "Test" },
      }).then(() => {
        console.log("updated presence");
      });
    });

    void listen("rpc://ready", () => {
      console.log("rpc ready");
    });
    void invoke("start_torrent", {
      url: "https://nyaa.si/download/1863828.torrent",
      server_port: 1337,
    });
    void listen<{ begin: number[]; block: number[]; index: number[] }>(
      "torrent://piece",
      async ({ payload }) => {
        const { begin, block, index } = payload;
        console.log("piece", begin, block, index);
        setChunks(new Uint8Array([...chunks, ...block]));
      },
    );
  }, []);

  return (
    <>
      <main className="container h-screen py-16">
        {chunks.length !== 0 ? (
          <video
            id="vid"
            controls
            src={URL.createObjectURL(new Blob([chunks]))}
          />
        ) : (
          "..."
        )}
      </main>
    </>
  );
};

export const Route = createFileRoute("/")({
  component: () => <Home />,
});
