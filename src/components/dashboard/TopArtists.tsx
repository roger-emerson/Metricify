'use client';

import {
  Box,
  Grid,
  Image,
  Text,
  VStack,
  Badge,
  Flex,
} from '@chakra-ui/react';
import { SpotifyArtist } from '@/types/spotify';

interface TopArtistsProps {
  artists: SpotifyArtist[];
}

export default function TopArtists({ artists }: TopArtistsProps) {
  return (
    <Grid
      templateColumns={{
        base: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(4, 1fr)',
        xl: 'repeat(5, 1fr)',
      }}
      gap={4}
    >
      {artists.map((artist, index) => (
        <Box
          key={artist.id}
          p={4}
          bg="whiteAlpha.100"
          borderRadius="lg"
          _hover={{
            bg: 'whiteAlpha.200',
            transform: 'translateY(-4px)',
          }}
          transition="all 0.3s"
          cursor="pointer"
          position="relative"
        >
          <Badge
            position="absolute"
            top={2}
            left={2}
            colorScheme="green"
            fontSize="sm"
            zIndex={1}
          >
            #{index + 1}
          </Badge>
          <VStack spacing={3} align="center">
            <Box
              position="relative"
              width="100%"
              paddingTop="100%"
              borderRadius="full"
              overflow="hidden"
            >
              <Image
                src={artist.images[0]?.url || '/placeholder-artist.png'}
                alt={artist.name}
                position="absolute"
                top={0}
                left={0}
                width="100%"
                height="100%"
                objectFit="cover"
              />
            </Box>
            <VStack spacing={1} align="center" width="100%">
              <Text
                fontWeight="bold"
                fontSize="sm"
                textAlign="center"
                noOfLines={1}
              >
                {artist.name}
              </Text>
              <Text fontSize="xs" color="gray.400" textAlign="center" noOfLines={1}>
                {artist.genres[0] || 'No genre'}
              </Text>
              <Flex gap={2} fontSize="xs" color="gray.500">
                <Text>{artist.followers.total.toLocaleString()} followers</Text>
              </Flex>
            </VStack>
          </VStack>
        </Box>
      ))}
    </Grid>
  );
}
