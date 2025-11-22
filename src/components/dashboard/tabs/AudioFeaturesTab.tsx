'use client';

import { VStack, Box, Text, SimpleGrid, Flex, Progress, Tooltip } from '@chakra-ui/react';

export default function AudioFeaturesTab({ data }: any) {
  const stats = data.audioStatistics || {};

  const features = [
    { name: 'Acousticness', value: stats.avgAcousticness, description: 'Confidence the track is acoustic', color: 'green' },
    { name: 'Danceability', value: stats.avgDanceability, description: 'How suitable for dancing', color: 'purple' },
    { name: 'Energy', value: stats.avgEnergy, description: 'Intensity and activity', color: 'red' },
    { name: 'Instrumentalness', value: stats.avgInstrumentalness, description: 'Predicts no vocals', color: 'blue' },
    { name: 'Liveness', value: stats.avgLiveness, description: 'Presence of audience', color: 'orange' },
    { name: 'Speechiness', value: stats.avgSpeechiness, description: 'Presence of spoken words', color: 'pink' },
    { name: 'Valence', value: stats.avgValence, description: 'Musical positiveness', color: 'yellow' },
  ];

  return (
    <VStack spacing={6} align="stretch">
      <Box p={6} bg="whiteAlpha.100" borderRadius="xl">
        <Text fontSize="2xl" fontWeight="bold" mb={6}>
          Detailed Audio Feature Analysis
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {features.map((feature) => (
            <FeatureCard key={feature.name} {...feature} />
          ))}
        </SimpleGrid>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <MetricBox
          title="Average Loudness"
          value={`${stats.avgLoudness?.toFixed(1)} dB`}
          subtitle="Overall volume"
        />
        <MetricBox
          title="Average Tempo"
          value={`${Math.round(stats.avgTempo || 0)} BPM`}
          subtitle="Beats per minute"
        />
        <MetricBox
          title="Tempo Range"
          value={`${Math.round(stats.minTempo || 0)}-${Math.round(stats.maxTempo || 0)}`}
          subtitle="BPM range"
        />
      </SimpleGrid>
    </VStack>
  );
}

function FeatureCard({ name, value, description, color }: any) {
  const percentage = ((value || 0) * 100).toFixed(1);

  return (
    <Tooltip label={description} placement="top" hasArrow>
      <Box
        p={6}
        bg="whiteAlpha.50"
        borderRadius="xl"
        border="1px solid"
        borderColor="whiteAlpha.200"
        _hover={{ borderColor: `${color}.400`, transform: 'translateY(-2px)' }}
        transition="all 0.3s"
        cursor="pointer"
      >
        <Text fontSize="sm" color="gray.400" mb={2}>{name}</Text>
        <Text fontSize="3xl" fontWeight="bold" color={`${color}.400`} mb={3}>
          {percentage}%
        </Text>
        <Progress
          value={value * 100}
          colorScheme={color}
          borderRadius="full"
          size="sm"
          hasStripe
          isAnimated
        />
      </Box>
    </Tooltip>
  );
}

function MetricBox({ title, value, subtitle }: any) {
  return (
    <Box p={6} bg="whiteAlpha.100" borderRadius="xl" textAlign="center">
      <Text fontSize="sm" color="gray.400" mb={2}>{title}</Text>
      <Text fontSize="2xl" fontWeight="bold" color="spotify.green">{value}</Text>
      <Text fontSize="xs" color="gray.500" mt={1}>{subtitle}</Text>
    </Box>
  );
}
