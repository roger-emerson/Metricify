'use client';

import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Icon,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Image,
  Flex,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiList,
  FiUsers,
  FiMusic,
  FiTrendingUp,
  FiHeart,
  FiStar,
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

interface PlaylistAnalyticsTabProps {
  data: any;
}

export default function PlaylistAnalyticsTab({ data }: PlaylistAnalyticsTabProps) {
  const cardBg = useColorModeValue('whiteAlpha.100', 'whiteAlpha.100');
  const borderColor = useColorModeValue('whiteAlpha.200', 'whiteAlpha.200');

  // Extract real data from API response
  const playlistAnalytics = data?.playlistAnalytics || {};
  const playlistStats = {
    totalPlaylists: playlistAnalytics.totalPlaylists || 0,
    totalTracks: playlistAnalytics.totalTracks || 0,
    ownedPlaylists: playlistAnalytics.ownedPlaylists || 0,
    followedPlaylists: playlistAnalytics.followedPlaylists || 0,
    collaborativePlaylists: playlistAnalytics.collaborativePlaylists || 0,
    averagePlaylistSize: playlistAnalytics.averagePlaylistSize || 0,
  };

  const topPlaylists = playlistAnalytics.topPlaylists || [];

  // Use genre analysis from main data
  const genreDistribution = (data?.genreAnalysis?.topGenres || []).slice(0, 6).map((g: any) => ({
    genre: g.genre,
    count: g.count,
  }));

  // Calculate average characteristics from audio statistics
  const audioStats = data?.audioStatistics || {};
  const playlistCharacteristics = [
    { characteristic: 'Energy', value: audioStats.avgEnergy || 0 },
    { characteristic: 'Danceability', value: audioStats.avgDanceability || 0 },
    { characteristic: 'Valence', value: audioStats.avgValence || 0 },
    { characteristic: 'Acousticness', value: audioStats.avgAcousticness || 0 },
    { characteristic: 'Instrumentalness', value: audioStats.avgInstrumentalness || 0 },
  ];

  // Placeholder for playlist growth (would need historical data)
  const playlistGrowth = [
    { month: 'Current', playlists: playlistStats.totalPlaylists, tracks: playlistStats.totalTracks },
  ];

  return (
    <VStack spacing={6} align="stretch">
      {/* Overview Statistics */}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
        <Card bg={cardBg} borderColor={borderColor} border="1px solid" borderRadius="xl">
          <CardBody textAlign="center">
            <Icon as={FiList} boxSize={6} color="spotify.green" mx="auto" mb={2} />
            <Text fontSize="sm" color="gray.400" mb={1}>
              Total Playlists
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              {playlistStats.totalPlaylists}
            </Text>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} border="1px solid" borderRadius="xl">
          <CardBody textAlign="center">
            <Icon as={FiMusic} boxSize={6} color="blue.400" mx="auto" mb={2} />
            <Text fontSize="sm" color="gray.400" mb={1}>
              Total Tracks
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              {playlistStats.totalTracks}
            </Text>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} border="1px solid" borderRadius="xl">
          <CardBody textAlign="center">
            <Icon as={FiHeart} boxSize={6} color="pink.400" mx="auto" mb={2} />
            <Text fontSize="sm" color="gray.400" mb={1}>
              Owned
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              {playlistStats.ownedPlaylists}
            </Text>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} border="1px solid" borderRadius="xl">
          <CardBody textAlign="center">
            <Icon as={FiStar} boxSize={6} color="yellow.400" mx="auto" mb={2} />
            <Text fontSize="sm" color="gray.400" mb={1}>
              Following
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              {playlistStats.followedPlaylists}
            </Text>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} border="1px solid" borderRadius="xl">
          <CardBody textAlign="center">
            <Icon as={FiUsers} boxSize={6} color="purple.400" mx="auto" mb={2} />
            <Text fontSize="sm" color="gray.400" mb={1}>
              Collaborative
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              {playlistStats.collaborativePlaylists}
            </Text>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderColor={borderColor} border="1px solid" borderRadius="xl">
          <CardBody textAlign="center">
            <Icon as={FiTrendingUp} boxSize={6} color="orange.400" mx="auto" mb={2} />
            <Text fontSize="sm" color="gray.400" mb={1}>
              Avg Size
            </Text>
            <Text fontSize="2xl" fontWeight="bold">
              {playlistStats.averagePlaylistSize}
            </Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Top Playlists */}
      <Card bg={cardBg} borderColor={borderColor} border="1px solid" borderRadius="xl">
        <CardHeader>
          <Heading size="md">🏆 Your Top Playlists</Heading>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Most played and diverse playlists
          </Text>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {topPlaylists.map((playlist: any, index: number) => (
              <Box
                key={playlist.id}
                p={4}
                bg="whiteAlpha.50"
                borderRadius="lg"
                _hover={{ bg: 'whiteAlpha.100' }}
                transition="all 0.2s"
              >
                <Flex gap={4} mb={3}>
                  <Box position="relative">
                    <Image
                      src={playlist.image}
                      alt={playlist.name}
                      boxSize="80px"
                      borderRadius="md"
                      fallbackSrc="https://via.placeholder.com/80"
                    />
                    <Badge
                      position="absolute"
                      top={-2}
                      left={-2}
                      colorScheme="green"
                      borderRadius="full"
                      px={2}
                    >
                      #{index + 1}
                    </Badge>
                  </Box>
                  <Box flex={1}>
                    <Flex justify="space-between" align="start">
                      <Box>
                        <Heading size="sm" mb={1}>
                          {playlist.name}
                        </Heading>
                        <HStack spacing={2} mb={2}>
                          <Text fontSize="sm" color="gray.400">
                            by {playlist.owner}
                          </Text>
                          {playlist.collaborative && (
                            <Badge colorScheme="purple" fontSize="xs">
                              Collaborative
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          {playlist.tracks} tracks • {playlist.genreDiversity} genres
                        </Text>
                      </Box>
                      <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                        {playlist.avgPopularity} pop
                      </Badge>
                    </Flex>
                  </Box>
                </Flex>

                <Grid templateColumns="repeat(4, 1fr)" gap={2}>
                  <Box>
                    <Text fontSize="xs" color="gray.500">
                      Energy
                    </Text>
                    <Progress
                      value={playlist.avgEnergy * 100}
                      colorScheme="red"
                      size="sm"
                      borderRadius="full"
                      mt={1}
                    />
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">
                      Dance
                    </Text>
                    <Progress
                      value={playlist.avgDanceability * 100}
                      colorScheme="blue"
                      size="sm"
                      borderRadius="full"
                      mt={1}
                    />
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">
                      Mood
                    </Text>
                    <Progress
                      value={playlist.avgValence * 100}
                      colorScheme="yellow"
                      size="sm"
                      borderRadius="full"
                      mt={1}
                    />
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500">
                      Diversity
                    </Text>
                    <Progress
                      value={(playlist.genreDiversity / 15) * 100}
                      colorScheme="purple"
                      size="sm"
                      borderRadius="full"
                      mt={1}
                    />
                  </Box>
                </Grid>
              </Box>
            ))}
          </VStack>
        </CardBody>
      </Card>

      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
        {/* Playlist Growth */}
        <Card bg={cardBg} borderColor={borderColor} border="1px solid" borderRadius="xl">
          <CardHeader>
            <Heading size="md">📈 Playlist Growth</Heading>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Your collection over time
            </Text>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={playlistGrowth}>
                <XAxis dataKey="month" stroke="#718096" />
                <YAxis stroke="#718096" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="playlists" fill="#1DB954" name="Playlists" />
                <Bar dataKey="tracks" fill="#1ed760" name="Tracks" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Playlist Characteristics */}
        <Card bg={cardBg} borderColor={borderColor} border="1px solid" borderRadius="xl">
          <CardHeader>
            <Heading size="md">🎵 Audio Profile</Heading>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Average characteristics across all playlists
            </Text>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={playlistCharacteristics}>
                <PolarGrid stroke="#4A5568" />
                <PolarAngleAxis dataKey="characteristic" stroke="#A0AEC0" />
                <PolarRadiusAxis stroke="#A0AEC0" />
                <Radar
                  name="Your Playlists"
                  dataKey="value"
                  stroke="#1DB954"
                  fill="#1DB954"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </Grid>

      {/* Genre Distribution */}
      <Card bg={cardBg} borderColor={borderColor} border="1px solid" borderRadius="xl">
        <CardHeader>
          <Heading size="md">🎸 Genre Distribution</Heading>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Genres across all your playlists
          </Text>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={genreDistribution} layout="vertical">
              <XAxis type="number" stroke="#718096" />
              <YAxis dataKey="genre" type="category" stroke="#718096" width={120} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#1DB954" />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </VStack>
  );
}
