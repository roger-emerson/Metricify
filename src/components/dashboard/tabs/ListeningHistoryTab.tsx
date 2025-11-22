'use client';

import RecentlyPlayedTracks from '@/components/dashboard/RecentlyPlayedTracks';
import { VStack, Box, Text, SimpleGrid, Stat, StatLabel, StatNumber } from '@chakra-ui/react';

export default function ListeningHistoryTab({ data }: any) {
  const dbAnalytics = data.databaseAnalytics;

  return (
    <VStack spacing={6} align="stretch">
      <Text fontSize="2xl" fontWeight="bold">Listening History & Patterns</Text>

      {dbAnalytics && (
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Box p={6} bg="whiteAlpha.100" borderRadius="xl">
            <Stat>
              <StatLabel>Tracks Analyzed</StatLabel>
              <StatNumber color="spotify.green">
                {dbAnalytics.topTracksHistory?.length || 0}
              </StatNumber>
            </Stat>
          </Box>
          <Box p={6} bg="whiteAlpha.100" borderRadius="xl">
            <Stat>
              <StatLabel>Artists Analyzed</StatLabel>
              <StatNumber color="spotify.green">
                {dbAnalytics.topArtistsHistory?.length || 0}
              </StatNumber>
            </Stat>
          </Box>
          <Box p={6} bg="whiteAlpha.100" borderRadius="xl">
            <Stat>
              <StatLabel>Patterns Found</StatLabel>
              <StatNumber color="spotify.green">
                {dbAnalytics.listeningPatterns?.length || 0}
              </StatNumber>
            </Stat>
          </Box>
          <Box p={6} bg="whiteAlpha.100" borderRadius="xl">
            <Stat>
              <StatLabel>Data Points</StatLabel>
              <StatNumber color="spotify.green">
                {Object.keys(data.audioFeatures || {}).length}
              </StatNumber>
            </Stat>
          </Box>
        </SimpleGrid>
      )}

      <Box>
        <Text fontSize="xl" fontWeight="bold" mb={4}>Recently Played</Text>
        <RecentlyPlayedTracks tracks={data.recentlyPlayed} />
      </Box>
    </VStack>
  );
}
