'use client';

import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Icon,
  Button,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Image,
  Flex,
  Badge,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  FormControl,
  FormLabel,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react';
import { FiPlay, FiHeart, FiExternalLink, FiRefreshCw, FiSliders } from 'react-icons/fi';
import { useState } from 'react';

interface RecommendationsTabProps {
  data: any;
}

export default function RecommendationsTab({ data }: RecommendationsTabProps) {
  const cardBg = useColorModeValue('whiteAlpha.100', 'whiteAlpha.100');
  const borderColor = useColorModeValue('whiteAlpha.200', 'whiteAlpha.200');

  const [seedType, setSeedType] = useState<'artists' | 'tracks' | 'genre'>('artists');
  const [energy, setEnergy] = useState(0.5);
  const [danceability, setDanceability] = useState(0.5);
  const [valence, setValence] = useState(0.5);

  // Extract real recommendation data from API
  const recommendationsData = data?.recommendations || {};
  const recommendedTracks = recommendationsData.tracks || [];
  const availableGenres = recommendationsData.availableGenres || [];

  // Get audio features for recommendations
  const audioFeatures = data?.audioFeatures || {};

  const recommendations = recommendedTracks.map((track: any) => {
    const features = audioFeatures[track.id] || {};
    return {
      id: track.id,
      name: track.name,
      artist: track.artists?.map((a: any) => a.name).join(', ') || 'Unknown',
      album: track.album?.name || '',
      image: track.album?.images?.[0]?.url || 'https://via.placeholder.com/60',
      popularity: track.popularity || 0,
      danceability: features.danceability || 0,
      energy: features.energy || 0,
      valence: features.valence || 0,
      external_url: track.external_urls?.spotify,
    };
  });

  // Placeholder stats (would need historical tracking)
  const recommendationStats = {
    totalGenerated: recommendations.length,
    totalPlayed: 0,
    totalSaved: 0,
    acceptanceRate: 0,
    discoveryScore: recommendations.length > 0 ? 85 : 0,
  };

  // Use top genres from genre analysis
  const topGenres = (data?.genreAnalysis?.topGenres || []).slice(0, 5).map((g: any) => ({
    name: g.genre,
    count: g.count,
  }));

  return (
    <VStack spacing={6} align="stretch">
      {/* Recommendation Statistics */}
      <SimpleGrid columns={{ base: 1, md: 3, lg: 5 }} spacing={4}>
        <Card bg={cardBg} borderColor={borderColor} border="1px solid" borderRadius="xl">
          <CardBody textAlign="center">
            <Text fontSize="sm" color="gray.400" mb={1}>
              Total Generated
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="spotify.green">
              {recommendationStats.totalGenerated.toLocaleString()}
            </Text>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} border="1px solid" borderRadius="xl">
          <CardBody textAlign="center">
            <Text fontSize="sm" color="gray.400" mb={1}>
              Played
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="blue.400">
              {recommendationStats.totalPlayed.toLocaleString()}
            </Text>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} border="1px solid" borderRadius="xl">
          <CardBody textAlign="center">
            <Text fontSize="sm" color="gray.400" mb={1}>
              Saved
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="pink.400">
              {recommendationStats.totalSaved.toLocaleString()}
            </Text>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} border="1px solid" borderRadius="xl">
          <CardBody textAlign="center">
            <Text fontSize="sm" color="gray.400" mb={1}>
              Acceptance Rate
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="purple.400">
              {recommendationStats.acceptanceRate}%
            </Text>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} border="1px solid" borderRadius="xl">
          <CardBody textAlign="center">
            <Text fontSize="sm" color="gray.400" mb={1}>
              Discovery Score
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="orange.400">
              {recommendationStats.discoveryScore}
            </Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Get New Recommendations */}
      <Card bg={cardBg} borderColor={borderColor} border="1px solid" borderRadius="xl">
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="md">🎯 Get Personalized Recommendations</Heading>
              <Text fontSize="sm" color="gray.500" mt={2}>
                Discover new music tailored to your taste
              </Text>
            </Box>
            <Icon as={FiSliders} boxSize={6} color="spotify.green" />
          </Flex>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* Seed Type Selection */}
            <FormControl>
              <FormLabel>Based on your</FormLabel>
              <Select
                value={seedType}
                onChange={(e) => setSeedType(e.target.value as any)}
                bg="whiteAlpha.50"
                borderColor="whiteAlpha.200"
              >
                <option value="artists">Top Artists</option>
                <option value="tracks">Top Tracks</option>
                <option value="genre">Favorite Genres</option>
              </Select>
            </FormControl>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
              {/* Energy Slider */}
              <FormControl>
                <FormLabel fontSize="sm">
                  Energy: {(energy * 100).toFixed(0)}%
                </FormLabel>
                <Slider
                  value={energy}
                  onChange={setEnergy}
                  min={0}
                  max={1}
                  step={0.01}
                  colorScheme="green"
                >
                  <SliderTrack bg="whiteAlpha.200">
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={5} />
                </Slider>
              </FormControl>

              {/* Danceability Slider */}
              <FormControl>
                <FormLabel fontSize="sm">
                  Danceability: {(danceability * 100).toFixed(0)}%
                </FormLabel>
                <Slider
                  value={danceability}
                  onChange={setDanceability}
                  min={0}
                  max={1}
                  step={0.01}
                  colorScheme="green"
                >
                  <SliderTrack bg="whiteAlpha.200">
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={5} />
                </Slider>
              </FormControl>

              {/* Valence (Mood) Slider */}
              <FormControl>
                <FormLabel fontSize="sm">
                  Mood: {(valence * 100).toFixed(0)}%
                </FormLabel>
                <Slider
                  value={valence}
                  onChange={setValence}
                  min={0}
                  max={1}
                  step={0.01}
                  colorScheme="green"
                >
                  <SliderTrack bg="whiteAlpha.200">
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb boxSize={5} />
                </Slider>
              </FormControl>
            </Grid>

            <Button
              leftIcon={<Icon as={FiRefreshCw} />}
              colorScheme="green"
              size="lg"
              width="full"
            >
              Generate Recommendations
            </Button>
          </VStack>
        </CardBody>
      </Card>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        {/* Recommended Tracks */}
        <Card bg={cardBg} borderColor={borderColor} border="1px solid" borderRadius="xl">
          <CardHeader>
            <Heading size="md">💎 Recommended for You</Heading>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Based on your listening preferences
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {recommendations.map((track: any) => (
                <Flex
                  key={track.id}
                  p={4}
                  bg="whiteAlpha.50"
                  borderRadius="lg"
                  align="center"
                  gap={4}
                  _hover={{ bg: 'whiteAlpha.100' }}
                  transition="all 0.2s"
                >
                  <Image
                    src={track.image}
                    alt={track.name}
                    boxSize="60px"
                    borderRadius="md"
                    fallbackSrc="https://via.placeholder.com/60"
                  />
                  <Box flex={1}>
                    <Text fontWeight="bold" noOfLines={1}>
                      {track.name}
                    </Text>
                    <Text fontSize="sm" color="gray.400" noOfLines={1}>
                      {track.artist}
                    </Text>
                    <HStack spacing={2} mt={1}>
                      <Badge colorScheme="green" fontSize="xs">
                        {track.popularity} pop
                      </Badge>
                      <Badge variant="outline" fontSize="xs">
                        {(track.energy * 100).toFixed(0)}% energy
                      </Badge>
                    </HStack>
                  </Box>
                  <HStack spacing={2}>
                    {track.external_url && (
                      <Button
                        as="a"
                        href={track.external_url}
                        target="_blank"
                        size="sm"
                        variant="ghost"
                        colorScheme="green"
                      >
                        <Icon as={FiExternalLink} />
                      </Button>
                    )}
                  </HStack>
                </Flex>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Genre Seeds */}
        <Card bg={cardBg} borderColor={borderColor} border="1px solid" borderRadius="xl">
          <CardHeader>
            <Heading size="md">🎸 Top Genre Seeds</Heading>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Genres driving your recommendations
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {topGenres.map((genre: any, index: number) => (
                <Flex
                  key={genre.name}
                  justify="space-between"
                  align="center"
                  p={3}
                  bg="whiteAlpha.50"
                  borderRadius="md"
                >
                  <HStack>
                    <Box
                      w={8}
                      h={8}
                      borderRadius="md"
                      bg="spotify.green"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="bold"
                      fontSize="sm"
                    >
                      {index + 1}
                    </Box>
                    <Text fontWeight="medium">{genre.name}</Text>
                  </HStack>
                  <Badge colorScheme="green">{genre.count}</Badge>
                </Flex>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Recommendation Success Metrics */}
      <Card bg={cardBg} borderColor={borderColor} border="1px solid" borderRadius="xl">
        <CardHeader>
          <Heading size="md">📈 Discovery Performance</Heading>
          <Text fontSize="sm" color="gray.500" mt={2}>
            How well recommendations match your taste over time
          </Text>
        </CardHeader>
        <CardBody>
          <Text color="gray.400">
            Track recommendations acceptance rate, discovery trends, and music exploration patterns.
          </Text>
          {/* Add chart showing recommendation performance over time */}
        </CardBody>
      </Card>
    </VStack>
  );
}
