'use client';

import {
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Box,
  Icon,
} from '@chakra-ui/react';
import { SpotifyArtist, SpotifyTrack, RecentlyPlayed } from '@/types/spotify';

interface ListeningStatsProps {
  topArtists: SpotifyArtist[];
  topTracks: SpotifyTrack[];
  recentlyPlayed: RecentlyPlayed[];
}

export default function ListeningStats({
  topArtists,
  topTracks,
  recentlyPlayed,
}: ListeningStatsProps) {
  // Calculate unique artists from recently played
  const uniqueRecentArtists = new Set(
    recentlyPlayed.flatMap((item) => item.track.artists.map((a) => a.id))
  ).size;

  // Calculate average popularity
  const avgPopularity = Math.round(
    topTracks.reduce((sum, track) => sum + track.popularity, 0) / topTracks.length
  );

  // Get top genre
  const genreCounts = topArtists.reduce((acc, artist) => {
    artist.genres.forEach((genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Calculate total listening time (approximate from recently played)
  const totalMs = recentlyPlayed.reduce((sum, item) => sum + item.track.duration_ms, 0);
  const totalHours = Math.round(totalMs / 3600000);

  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
      <Box p={6} bg="whiteAlpha.100" borderRadius="xl">
        <Stat>
          <StatLabel>Top Artists</StatLabel>
          <StatNumber color="spotify.green">{topArtists.length}</StatNumber>
          <StatHelpText>In your library</StatHelpText>
        </Stat>
      </Box>

      <Box p={6} bg="whiteAlpha.100" borderRadius="xl">
        <Stat>
          <StatLabel>Avg. Popularity</StatLabel>
          <StatNumber color="spotify.green">{avgPopularity}%</StatNumber>
          <StatHelpText>Of your top tracks</StatHelpText>
        </Stat>
      </Box>

      <Box p={6} bg="whiteAlpha.100" borderRadius="xl">
        <Stat>
          <StatLabel>Top Genre</StatLabel>
          <StatNumber color="spotify.green" fontSize="lg" textTransform="capitalize">
            {topGenre}
          </StatNumber>
          <StatHelpText>Most listened</StatHelpText>
        </Stat>
      </Box>

      <Box p={6} bg="whiteAlpha.100" borderRadius="xl">
        <Stat>
          <StatLabel>Recent Artists</StatLabel>
          <StatNumber color="spotify.green">{uniqueRecentArtists}</StatNumber>
          <StatHelpText>Last 50 plays</StatHelpText>
        </Stat>
      </Box>
    </SimpleGrid>
  );
}
