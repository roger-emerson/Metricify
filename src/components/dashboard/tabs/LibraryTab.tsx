'use client';

import { VStack, Box, Text, SimpleGrid, Image, Flex, Badge } from '@chakra-ui/react';

export default function LibraryTab({ data }: any) {
  const savedTracks = data.savedTracks || [];
  const savedAlbums = data.savedAlbums || [];
  const playlists = data.playlists || [];

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>Saved Tracks</Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
          {savedTracks.slice(0, 10).map((item: any) => (
            <Flex
              key={item.track.id}
              p={4}
              bg="whiteAlpha.100"
              borderRadius="lg"
              align="center"
              gap={4}
              _hover={{ bg: 'whiteAlpha.200' }}
            >
              <Image
                src={item.track.album.images[0]?.url}
                alt={item.track.name}
                boxSize="50px"
                borderRadius="md"
              />
              <Box flex={1} minW={0}>
                <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                  {item.track.name}
                </Text>
                <Text fontSize="xs" color="gray.400" noOfLines={1}>
                  {item.track.artists.map((a: any) => a.name).join(', ')}
                </Text>
              </Box>
            </Flex>
          ))}
        </SimpleGrid>
      </Box>

      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>Your Playlists</Text>
        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
          {playlists.slice(0, 12).map((playlist: any) => (
            <Box
              key={playlist.id}
              p={4}
              bg="whiteAlpha.100"
              borderRadius="lg"
              _hover={{ bg: 'whiteAlpha.200', transform: 'translateY(-2px)' }}
              transition="all 0.2s"
            >
              <Box position="relative" mb={3}>
                {playlist.images[0] && (
                  <Image
                    src={playlist.images[0].url}
                    alt={playlist.name}
                    borderRadius="md"
                    w="100%"
                    aspectRatio={1}
                  />
                )}
                <Badge
                  position="absolute"
                  bottom={2}
                  right={2}
                  colorScheme="green"
                  fontSize="xs"
                >
                  {playlist.tracks.total} tracks
                </Badge>
              </Box>
              <Text fontWeight="bold" fontSize="sm" noOfLines={2}>
                {playlist.name}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </VStack>
  );
}
