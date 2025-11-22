'use client';

import { VStack, Box, Text, SimpleGrid, Flex, Progress } from '@chakra-ui/react';

export default function GenreAnalysisTab({ data }: any) {
  const genreAnalysis = data.genreAnalysis || {};
  const topGenres = genreAnalysis.topGenres || [];

  const maxCount = topGenres[0]?.count || 1;

  return (
    <VStack spacing={6} align="stretch">
      <Box p={6} bg="whiteAlpha.100" borderRadius="xl">
        <Flex justify="space-between" align="center" mb={6}>
          <Text fontSize="2xl" fontWeight="bold">
            Your Genre Universe
          </Text>
          <Text fontSize="lg" color="spotify.green" fontWeight="bold">
            {genreAnalysis.totalUniqueGenres} Genres
          </Text>
        </Flex>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {topGenres.map((genre: any, index: number) => (
            <GenreBar
              key={genre.genre}
              rank={index + 1}
              genre={genre.genre}
              count={genre.count}
              maxCount={maxCount}
            />
          ))}
        </SimpleGrid>
      </Box>
    </VStack>
  );
}

function GenreBar({ rank, genre, count, maxCount }: any) {
  const percentage = (count / maxCount) * 100;

  return (
    <Box
      p={4}
      bg="whiteAlpha.50"
      borderRadius="lg"
      _hover={{ bg: 'whiteAlpha.100', transform: 'translateX(4px)' }}
      transition="all 0.2s"
    >
      <Flex align="center" mb={2}>
        <Flex
          w="32px"
          h="32px"
          align="center"
          justify="center"
          bg="spotify.green"
          color="white"
          borderRadius="full"
          fontSize="sm"
          fontWeight="bold"
          mr={3}
        >
          {rank}
        </Flex>
        <Text flex={1} fontSize="md" fontWeight="medium" textTransform="capitalize">
          {genre}
        </Text>
        <Text fontSize="sm" color="gray.400">{count} artists</Text>
      </Flex>
      <Progress
        value={percentage}
        colorScheme="green"
        borderRadius="full"
        size="sm"
        hasStripe
      />
    </Box>
  );
}
