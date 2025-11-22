'use client';

import {
  VStack,
  SimpleGrid,
  Box,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  Flex,
  Progress,
  Tooltip,
} from '@chakra-ui/react';

interface OverviewTabProps {
  data: any;
}

export default function OverviewTab({ data }: OverviewTabProps) {
  const audioStats = data?.audioStatistics || {};
  const genreAnalysis = data?.genreAnalysis || {};
  const musicalAnalysis = data?.musicalAnalysis || {};

  // Debug logging
  console.log('OverviewTab audioStats:', audioStats);
  console.log('OverviewTab data.library:', data?.library);

  return (
    <VStack spacing={6} align="stretch">
      {/* Key Metrics Grid */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <StatCard
          label="Saved Tracks"
          value={data.library.totalSavedTracks.toLocaleString()}
          helpText="In your library"
          color="green"
        />
        <StatCard
          label="Saved Albums"
          value={data.library.totalSavedAlbums.toLocaleString()}
          helpText="Collections"
          color="purple"
        />
        <StatCard
          label="Playlists"
          value={data.library.totalPlaylists.toLocaleString()}
          helpText="Curated lists"
          color="blue"
        />
        <StatCard
          label="Following"
          value={data.library.totalFollowedArtists.toLocaleString()}
          helpText="Artists"
          color="pink"
        />
      </SimpleGrid>

      {/* Audio Features Overview */}
      <Box p={6} bg="whiteAlpha.100" borderRadius="xl">
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Your Musical Profile
        </Text>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          <AudioFeatureBar
            label="Energy"
            value={audioStats.avgEnergy}
            description="High energy music preference"
            color="red.400"
          />
          <AudioFeatureBar
            label="Danceability"
            value={audioStats.avgDanceability}
            description="How danceable your music is"
            color="purple.400"
          />
          <AudioFeatureBar
            label="Valence (Happiness)"
            value={audioStats.avgValence}
            description="Musical positivity"
            color="yellow.400"
          />
          <AudioFeatureBar
            label="Acousticness"
            value={audioStats.avgAcousticness}
            description="Acoustic vs electronic"
            color="green.400"
          />
        </Grid>
      </Box>

      {/* Top Genres */}
      <Box p={6} bg="whiteAlpha.100" borderRadius="xl">
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="xl" fontWeight="bold">
            Top Genres
          </Text>
          <Text fontSize="sm" color="gray.500">
            {genreAnalysis.totalUniqueGenres} total genres
          </Text>
        </Flex>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
          {genreAnalysis.topGenres?.slice(0, 10).map((genre: any, index: number) => (
            <GenreItem key={genre.genre} genre={genre.genre} count={genre.count} rank={index + 1} />
          ))}
        </SimpleGrid>
      </Box>

      {/* Musical Characteristics */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Box p={6} bg="whiteAlpha.100" borderRadius="xl">
          <Text fontSize="lg" fontWeight="bold" mb={3}>
            Tempo Preference
          </Text>
          <VStack spacing={2} align="stretch">
            <TempoBar
              label="Slow (<90 BPM)"
              count={musicalAnalysis.tempoRanges?.slow || 0}
              max={musicalAnalysis.tempoRanges?.total || 1}
              color="blue"
            />
            <TempoBar
              label="Moderate (90-120)"
              count={musicalAnalysis.tempoRanges?.moderate || 0}
              max={musicalAnalysis.tempoRanges?.total || 1}
              color="green"
            />
            <TempoBar
              label="Fast (120-150)"
              count={musicalAnalysis.tempoRanges?.fast || 0}
              max={musicalAnalysis.tempoRanges?.total || 1}
              color="orange"
            />
            <TempoBar
              label="Very Fast (>150)"
              count={musicalAnalysis.tempoRanges?.veryFast || 0}
              max={musicalAnalysis.tempoRanges?.total || 1}
              color="red"
            />
          </VStack>
        </Box>

        <Box p={6} bg="whiteAlpha.100" borderRadius="xl">
          <Text fontSize="lg" fontWeight="bold" mb={3}>
            Average Tempo
          </Text>
          <Flex align="baseline" justify="center" direction="column" height="100%">
            <Text fontSize="4xl" fontWeight="bold" color="spotify.green">
              {Math.round(audioStats.avgTempo || 0)}
            </Text>
            <Text fontSize="lg" color="gray.400">BPM</Text>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Range: {Math.round(audioStats.minTempo || 0)} - {Math.round(audioStats.maxTempo || 0)} BPM
            </Text>
          </Flex>
        </Box>

        <Box p={6} bg="whiteAlpha.100" borderRadius="xl">
          <Text fontSize="lg" fontWeight="bold" mb={3}>
            Energy Range
          </Text>
          <Flex align="baseline" justify="center" direction="column" height="100%">
            <Text fontSize="4xl" fontWeight="bold" color="spotify.green">
              {((audioStats.avgEnergy || 0) * 100).toFixed(0)}%
            </Text>
            <Text fontSize="lg" color="gray.400">Average</Text>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Range: {((audioStats.minEnergy || 0) * 100).toFixed(0)}% - {((audioStats.maxEnergy || 0) * 100).toFixed(0)}%
            </Text>
          </Flex>
        </Box>
      </SimpleGrid>
    </VStack>
  );
}

function StatCard({ label, value, helpText, color }: any) {
  return (
    <Box p={6} bg="whiteAlpha.100" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.200">
      <Stat>
        <StatLabel fontSize="sm" color="gray.400">{label}</StatLabel>
        <StatNumber fontSize="3xl" color={`${color}.400`}>{value}</StatNumber>
        <StatHelpText fontSize="xs" color="gray.500">{helpText}</StatHelpText>
      </Stat>
    </Box>
  );
}

function AudioFeatureBar({ label, value, description, color }: any) {
  const percentage = ((value || 0) * 100).toFixed(1);

  return (
    <Tooltip label={description} placement="top" hasArrow>
      <Box>
        <Flex justify="space-between" mb={1}>
          <Text fontSize="sm" fontWeight="medium">{label}</Text>
          <Text fontSize="sm" color="gray.400">{percentage}%</Text>
        </Flex>
        <Progress
          value={value * 100}
          colorScheme={color.split('.')[0]}
          borderRadius="full"
          size="sm"
          hasStripe
          isAnimated
        />
      </Box>
    </Tooltip>
  );
}

function GenreItem({ genre, count, rank }: any) {
  return (
    <Flex
      align="center"
      p={3}
      bg="whiteAlpha.50"
      borderRadius="lg"
      _hover={{ bg: 'whiteAlpha.100' }}
      transition="all 0.2s"
    >
      <Flex
        w="24px"
        h="24px"
        align="center"
        justify="center"
        bg="spotify.green"
        color="white"
        borderRadius="full"
        fontSize="xs"
        fontWeight="bold"
        mr={3}
      >
        {rank}
      </Flex>
      <Text flex={1} fontSize="sm" textTransform="capitalize" noOfLines={1}>
        {genre}
      </Text>
      <Text fontSize="xs" color="gray.500">{count}</Text>
    </Flex>
  );
}

function TempoBar({ label, count, max, color }: any) {
  const percentage = max > 0 ? (count / max) * 100 : 0;

  return (
    <Flex align="center" gap={2}>
      <Text fontSize="sm" w="140px" noOfLines={1}>{label}</Text>
      <Box flex={1}>
        <Progress
          value={percentage}
          colorScheme={color}
          borderRadius="full"
          size="sm"
        />
      </Box>
      <Text fontSize="sm" color="gray.500" w="40px" textAlign="right">{count}</Text>
    </Flex>
  );
}
