'use client';

import {
  Box,
  Flex,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';
import { RecentlyPlayed } from '@/types/spotify';

interface RecentlyPlayedTracksProps {
  tracks: RecentlyPlayed[];
}

export default function RecentlyPlayedTracks({ tracks }: RecentlyPlayedTracksProps) {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const played = new Date(timestamp).getTime();
    const diff = now - played;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <VStack spacing={2} align="stretch">
      {tracks.slice(0, 10).map((item, index) => (
        <Flex
          key={`${item.track.id}-${item.played_at}-${index}`}
          p={4}
          bg="whiteAlpha.100"
          borderRadius="lg"
          align="center"
          gap={4}
          _hover={{
            bg: 'whiteAlpha.200',
          }}
          transition="all 0.3s"
        >
          <Image
            src={item.track.album.images[0]?.url}
            alt={item.track.album.name}
            boxSize="50px"
            borderRadius="md"
            objectFit="cover"
          />
          <Box flex={1} minW={0}>
            <Text fontWeight="semibold" fontSize="sm" noOfLines={1}>
              {item.track.name}
            </Text>
            <Text fontSize="xs" color="gray.400" noOfLines={1}>
              {item.track.artists.map((a) => a.name).join(', ')}
            </Text>
          </Box>
          <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
            {formatTimeAgo(item.played_at)}
          </Text>
        </Flex>
      ))}
    </VStack>
  );
}
