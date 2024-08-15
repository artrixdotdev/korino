import type { Provider } from "next-auth/providers";

import { client } from "@korino/anilist";
import { GET_CURRENT_USER } from "@korino/anilist/queries";

import { env } from "../env";

export default {
  id: "AniListProvider",
  name: "Anilist",
  type: "oauth",
  authorization: {
    url: "https://anilist.co/api/v2/oauth/authorize",
    params: { scope: "", response_type: "code" },
  },
  token: "https://anilist.co/api/v2/oauth/token",
  clientId: env.AUTH_ANILIST_ID,
  clientSecret: env.AUTH_ANILIST_SECRET,
  profile(profile: Record<string, string>) {
    console.log(profile);
    return {
      id: profile.sub,
      name: profile.name,
      image: profile.image_url,
    };
  },

  userinfo: {
    url: "https://graphql.anilist.co",

    async request(context: { tokens: Record<string, string> }) {
      const { data } = await client.query<{
        Viewer: { name: string; id: number; avatar: Record<string, string> };
      }>({
        query: GET_CURRENT_USER,
        context: {
          headers: {
            Authorization: "Bearer " + context.tokens.access_token,
          },
        },
      });

      return {
        name: data.Viewer.name,
        sub: data.Viewer.id,
        image: data.Viewer.avatar.large,
      };
    },
  },
} satisfies Provider;
