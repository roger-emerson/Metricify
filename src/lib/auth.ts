import { NextAuthOptions } from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';

const scopes = [
  // User Profile & Account
  'user-read-email',
  'user-read-private',

  // Listening History & Top Items
  'user-top-read',
  'user-read-recently-played',

  // Library Access
  'user-library-read',

  // Playlists
  'playlist-read-private',
  'playlist-read-collaborative',

  // Following
  'user-follow-read',

  // Playback & Real-Time Data
  'user-read-playback-state',
  'user-read-currently-playing',
  'user-read-playback-position',
].join(' ');

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: scopes,
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.spotifyId = profile?.id; // Add Spotify user ID to token
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.spotifyId = token.spotifyId as string; // Pass Spotify ID to session
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful sign in
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/dashboard`;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: '/',
  },
};
