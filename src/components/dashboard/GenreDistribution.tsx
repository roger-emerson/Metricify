'use client';

import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Progress,
  VStack,
} from '@chakra-ui/react';
import { SpotifyArtist } from '@/types/spotify';

interface GenreDistributionProps {
  artists: SpotifyArtist[];
}

export default function GenreDistribution({ artists }: GenreDistributionProps) {
  // Count genre occurrences
  const genreCounts = artists.reduce((acc, artist) => {
    artist.genres.forEach((genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Sort and get top 10 genres
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const maxCount = topGenres[0]?.[1] || 1;

  return (
    <Box p={6} bg="whiteAlpha.100" borderRadius="xl">
      <Heading size="md" mb={4}>
        Your Top Genres
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {topGenres.map(([genre, count]) => (
          <VStack key={genre} align="stretch" spacing={2}>
            <Text fontSize="sm" fontWeight="semibold" textTransform="capitalize">
              {genre}
            </Text>
            <Progress
              value={(count / maxCount) * 100}
              colorScheme="green"
              borderRadius="full"
              size="sm"
            />
            <Text fontSize="xs" color="gray.500">
              {count} artist{count > 1 ? 's' : ''}
            </Text>
          </VStack>
        ))}
      </SimpleGrid>
    </Box>
  );
}
