'use client';

import {
  Box,
  Flex,
  Image,
  Text,
  VStack,
  Badge,
  HStack,
} from '@chakra-ui/react';
import { SpotifyTrack } from '@/types/spotify';

interface TopTracksProps {
  tracks: SpotifyTrack[];
}

export default function TopTracks({ tracks }: TopTracksProps) {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <VStack spacing={2} align="stretch">
      {tracks.map((track, index) => (
        <Flex
          key={track.id}
          p={4}
          bg="whiteAlpha.100"
          borderRadius="lg"
          align="center"
          gap={4}
          _hover={{
            bg: 'whiteAlpha.200',
            transform: 'translateX(4px)',
          }}
          transition="all 0.3s"
          cursor="pointer"
        >
          <Badge colorScheme="green" fontSize="md" minW="30px" textAlign="center">
            {index + 1}
          </Badge>
          <Image
            src={track.album.images[0]?.url}
            alt={track.album.name}
            boxSize="60px"
            borderRadius="md"
            objectFit="cover"
          />
          <Box flex={1} minW={0}>
            <Text fontWeight="bold" fontSize="md" noOfLines={1}>
              {track.name}
            </Text>
            <Text fontSize="sm" color="gray.400" noOfLines={1}>
              {track.artists.map((a) => a.name).join(', ')}
            </Text>
          </Box>
          <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
            <Text fontSize="sm" color="gray.500">
              {formatDuration(track.duration_ms)}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Popularity: {track.popularity}
            </Text>
          </HStack>
        </Flex>
      ))}
    </VStack>
  );
}
