'use client';

import {
  Box,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Text,
  VStack,
  HStack,
  Icon,
  Progress,
  Flex,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiSmartphone,
  FiMonitor,
  FiSpeaker,
  FiHeadphones,
  FiMusic,
  FiList,
  FiDisc,
  FiShuffle,
  FiRepeat,
} from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface PlaybackInsightsTabProps {
  data: any;
}

export default function PlaybackInsightsTab({ data }: PlaybackInsightsTabProps) {
  const cardBg = useColorModeValue('whiteAlpha.100', 'whiteAlpha.100');
  const borderColor = useColorModeValue('whiteAlpha.200', 'whiteAlpha.200');

  // Extract real playback data from API
  const playbackInsights = data?.playbackInsights || {};
  const currentPlayback = playbackInsights.currentPlayback;
  const currentlyPlaying = playbackInsights.currentlyPlaying;
  const queue = playbackInsights.queue;

  // Analyze recently played for context data
  const recentlyPlayed = data?.recentlyPlayed || [];
  const contextMap = new Map<string, number>();

  recentlyPlayed.forEach((item: any) => {
    const context = item.context?.type || 'unknown';
    contextMap.set(context, (contextMap.get(context) || 0) + 1);
  });

  const contextData = [
    { name: 'Playlists', value: contextMap.get('playlist') || 0, color: '#1DB954' },
    { name: 'Albums', value: contextMap.get('album') || 0, color: '#1ed760' },
    { name: 'Artist Pages', value: contextMap.get('artist') || 0, color: '#2ebd68' },
    { name: 'Collection', value: contextMap.get('collection') || 0, color: '#4cc376' },
    { name: 'Other', value: contextMap.get('unknown') || 0, color: '#6bc984' },
  ].filter(item => item.value > 0);

  // Placeholder device data (Spotify API doesn't provide historical device usage)
  const deviceData: any[] = [];

  // Placeholder for playback modes (would need historical tracking)
  const playbackModes = {
    shuffle: { enabled: 50, disabled: 50 },
    repeat: { off: 70, context: 20, track: 10 },
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'smartphone':
        return FiSmartphone;
      case 'computer':
        return FiMonitor;
      case 'speaker':
        return FiSpeaker;
      case 'tablet':
        return FiHeadphones;
      default:
        return FiMusic;
    }
  };

  const getContextIcon = (name: string) => {
    switch (name) {
      case 'Playlists':
        return FiList;
      case 'Albums':
        return FiDisc;
      default:
        return FiMusic;
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Current Playback (if available) */}
      <Card
        bg={cardBg}
        borderColor={borderColor}
        border="1px solid"
        borderRadius="xl"
      >
        <CardHeader>
          <Heading size="md">🎵 Current Playback</Heading>
        </CardHeader>
        <CardBody>
          {currentlyPlaying?.item ? (
            <Flex align="center" gap={4}>
              {currentlyPlaying.item.album?.images?.[0]?.url && (
                <Box
                  boxSize="80px"
                  borderRadius="md"
                  bgImage={`url(${currentlyPlaying.item.album.images[0].url})`}
                  bgSize="cover"
                  bgPosition="center"
                />
              )}
              <Box flex={1}>
                <Text fontSize="lg" fontWeight="bold">
                  {currentlyPlaying.item.name}
                </Text>
                <Text color="gray.400">
                  {currentlyPlaying.item.artists?.map((a: any) => a.name).join(', ')}
                </Text>
                <HStack mt={2} spacing={2}>
                  <Badge colorScheme={currentlyPlaying.is_playing ? 'green' : 'gray'}>
                    {currentlyPlaying.is_playing ? 'Playing' : 'Paused'}
                  </Badge>
                  {currentPlayback?.device && (
                    <Badge variant="outline">
                      {currentPlayback.device.name}
                    </Badge>
                  )}
                </HStack>
              </Box>
            </Flex>
          ) : (
            <Text color="gray.400">
              No active playback. Start playing music on Spotify to see real-time data here.
            </Text>
          )}
        </CardBody>
      </Card>

      {/* Device Usage Statistics */}
      <Card
        bg={cardBg}
        borderColor={borderColor}
        border="1px solid"
        borderRadius="xl"
      >
        <CardHeader>
          <Heading size="md">📱 Current Device</Heading>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Your active playback device
          </Text>
        </CardHeader>
        <CardBody>
          {currentPlayback?.device ? (
            <VStack spacing={4} align="stretch">
              <Flex align="center" gap={4}>
                <Icon
                  as={getDeviceIcon(currentPlayback.device.type)}
                  boxSize={8}
                  color="spotify.green"
                />
                <Box flex={1}>
                  <Text fontSize="lg" fontWeight="bold">
                    {currentPlayback.device.name}
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    {currentPlayback.device.type}
                  </Text>
                </Box>
                <Badge colorScheme="green" fontSize="md">
                  {currentPlayback.device.volume_percent}% volume
                </Badge>
              </Flex>
            </VStack>
          ) : (
            <Text color="gray.400">
              No active device. Historical device usage tracking coming soon.
            </Text>
          )}
        </CardBody>
      </Card>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
        {/* Listening Context Distribution */}
        <Card
          bg={cardBg}
          borderColor={borderColor}
          border="1px solid"
          borderRadius="xl"
        >
          <CardHeader>
            <Heading size="md">🎯 Listening Context</Heading>
            <Text fontSize="sm" color="gray.500" mt={2}>
              How you discover and play music
            </Text>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={contextData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contextData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <VStack spacing={2} mt={4} align="stretch">
              {contextData.map((context) => (
                <Flex key={context.name} justify="space-between" align="center">
                  <HStack>
                    <Box
                      w={3}
                      h={3}
                      borderRadius="full"
                      bg={context.color}
                    />
                    <Text fontSize="sm">{context.name}</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.400">
                    {context.value} plays
                  </Text>
                </Flex>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Playback Modes */}
        <Card
          bg={cardBg}
          borderColor={borderColor}
          border="1px solid"
          borderRadius="xl"
        >
          <CardHeader>
            <Heading size="md">⚙️ Playback Preferences</Heading>
            <Text fontSize="sm" color="gray.500" mt={2}>
              Your shuffle and repeat habits
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* Shuffle Statistics */}
              <Box>
                <Flex align="center" gap={2} mb={3}>
                  <Icon as={FiShuffle} boxSize={5} color="spotify.green" />
                  <Text fontWeight="bold">Shuffle Mode</Text>
                </Flex>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box
                    p={4}
                    bg="whiteAlpha.50"
                    borderRadius="lg"
                    textAlign="center"
                  >
                    <Text fontSize="2xl" fontWeight="bold" color="spotify.green">
                      {playbackModes.shuffle.enabled}%
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      Enabled
                    </Text>
                  </Box>
                  <Box
                    p={4}
                    bg="whiteAlpha.50"
                    borderRadius="lg"
                    textAlign="center"
                  >
                    <Text fontSize="2xl" fontWeight="bold">
                      {playbackModes.shuffle.disabled}%
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      Disabled
                    </Text>
                  </Box>
                </Grid>
              </Box>

              {/* Repeat Statistics */}
              <Box>
                <Flex align="center" gap={2} mb={3}>
                  <Icon as={FiRepeat} boxSize={5} color="spotify.green" />
                  <Text fontWeight="bold">Repeat Mode</Text>
                </Flex>
                <VStack spacing={2} align="stretch">
                  <Flex justify="space-between">
                    <Text fontSize="sm">Off</Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {playbackModes.repeat.off}%
                    </Text>
                  </Flex>
                  <Progress
                    value={playbackModes.repeat.off}
                    colorScheme="green"
                    borderRadius="full"
                    size="sm"
                  />

                  <Flex justify="space-between" mt={2}>
                    <Text fontSize="sm">Repeat Context</Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {playbackModes.repeat.context}%
                    </Text>
                  </Flex>
                  <Progress
                    value={playbackModes.repeat.context}
                    colorScheme="green"
                    borderRadius="full"
                    size="sm"
                  />

                  <Flex justify="space-between" mt={2}>
                    <Text fontSize="sm">Repeat Track</Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {playbackModes.repeat.track}%
                    </Text>
                  </Flex>
                  <Progress
                    value={playbackModes.repeat.track}
                    colorScheme="green"
                    borderRadius="full"
                    size="sm"
                  />
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Queue Insights */}
      <Card
        bg={cardBg}
        borderColor={borderColor}
        border="1px solid"
        borderRadius="xl"
      >
        <CardHeader>
          <Heading size="md">📋 Queue Insights</Heading>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Your upcoming tracks
          </Text>
        </CardHeader>
        <CardBody>
          {queue?.queue && queue.queue.length > 0 ? (
            <VStack spacing={3} align="stretch">
              {queue.queue.slice(0, 5).map((track: any, index: number) => (
                <Flex key={track.id + index} align="center" gap={3}>
                  <Text fontSize="sm" color="gray.500" minW="20px">
                    {index + 1}
                  </Text>
                  <Box
                    boxSize="40px"
                    borderRadius="md"
                    bgImage={track.album?.images?.[0]?.url ? `url(${track.album.images[0].url})` : undefined}
                    bgSize="cover"
                    bgPosition="center"
                    bg={!track.album?.images?.[0]?.url ? 'whiteAlpha.200' : undefined}
                  />
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                      {track.name}
                    </Text>
                    <Text fontSize="xs" color="gray.400" noOfLines={1}>
                      {track.artists?.map((a: any) => a.name).join(', ')}
                    </Text>
                  </Box>
                </Flex>
              ))}
              {queue.queue.length > 5 && (
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  +{queue.queue.length - 5} more tracks in queue
                </Text>
              )}
            </VStack>
          ) : (
            <Text color="gray.400">
              No queue available. Start playing music to see upcoming tracks.
            </Text>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
}
