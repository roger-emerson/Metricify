'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Spinner,
  VStack,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Avatar,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';

// Import tab components
import OverviewTab from '@/components/dashboard/tabs/OverviewTab';
import AudioFeaturesTab from '@/components/dashboard/tabs/AudioFeaturesTab';
import GenreAnalysisTab from '@/components/dashboard/tabs/GenreAnalysisTab';
import ListeningHistoryTab from '@/components/dashboard/tabs/ListeningHistoryTab';
import LibraryTab from '@/components/dashboard/tabs/LibraryTab';
import TopArtistsTab from '@/components/dashboard/tabs/TopArtistsTab';
import TopTracksTab from '@/components/dashboard/tabs/TopTracksTab';
import PlaybackInsightsTab from '@/components/dashboard/tabs/PlaybackInsightsTab';
import RecommendationsTab from '@/components/dashboard/tabs/RecommendationsTab';
import PlaylistAnalyticsTab from '@/components/dashboard/tabs/PlaylistAnalyticsTab';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabBg = useColorModeValue('whiteAlpha.100', 'whiteAlpha.100');
  const selectedTabBg = useColorModeValue('spotify.green', 'spotify.green');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAnalyticsData();
    }
  }, [status]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/spotify/analytics');

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Container maxW="container.xl" py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" color="spotify.green" thickness="4px" />
          <Text fontSize="lg">Loading your comprehensive analytics...</Text>
          <Text fontSize="sm" color="gray.500">
            Fetching audio features, genre data, and listening patterns
          </Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={20}>
        <VStack spacing={4}>
          <Text color="red.400" fontSize="xl">
            Error: {error}
          </Text>
          <Text color="gray.400">
            Try refreshing the page or logging in again
          </Text>
        </VStack>
      </Container>
    );
  }

  if (!analyticsData) {
    return null;
  }

  return (
    <Box minH="100vh" pb={10}>
      <Container maxW="container.xl" pt={6}>
        {/* User Profile Header */}
        <Flex
          align="center"
          gap={6}
          p={6}
          mb={6}
          bg="whiteAlpha.100"
          borderRadius="2xl"
          border="1px solid"
          borderColor="whiteAlpha.200"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            bgGradient: 'linear(to-r, spotify.green, green.400)',
          }}
        >
          <Avatar
            size="xl"
            name={analyticsData.user.display_name}
            src={analyticsData.user.images[0]?.url}
            border="3px solid"
            borderColor="spotify.green"
          />
          <Box flex={1}>
            <Flex align="center" gap={3} mb={2}>
              <Text fontSize="2xl" fontWeight="bold">
                {analyticsData.user.display_name}
              </Text>
              <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
                Premium Analytics
              </Badge>
            </Flex>
            <Text color="gray.400" fontSize="sm">
              {analyticsData.user.followers.total.toLocaleString()} Spotify followers
            </Text>
          </Box>
          <VStack align="end" spacing={1}>
            <Text fontSize="sm" color="gray.500">
              Library Size
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color="spotify.green">
              {analyticsData.library.totalSavedTracks.toLocaleString()}
            </Text>
            <Text fontSize="xs" color="gray.500">
              saved tracks
            </Text>
          </VStack>
        </Flex>

        {/* Main Tabs */}
        <Tabs
          variant="soft-rounded"
          colorScheme="green"
          isLazy
          lazyBehavior="keepMounted"
        >
          <TabList
            mb={6}
            p={2}
            bg="whiteAlpha.50"
            borderRadius="xl"
            overflowX="auto"
            css={{
              '&::-webkit-scrollbar': {
                height: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(29, 185, 84, 0.3)',
                borderRadius: '3px',
              },
            }}
          >
            <Tab
              _selected={{
                bg: selectedTabBg,
                color: 'white',
                fontWeight: 'bold',
              }}
              fontWeight="medium"
              px={6}
              whiteSpace="nowrap"
            >
              📊 Overview
            </Tab>
            <Tab
              _selected={{
                bg: selectedTabBg,
                color: 'white',
                fontWeight: 'bold',
              }}
              fontWeight="medium"
              px={6}
              whiteSpace="nowrap"
            >
              🎵 Audio Features
            </Tab>
            <Tab
              _selected={{
                bg: selectedTabBg,
                color: 'white',
                fontWeight: 'bold',
              }}
              fontWeight="medium"
              px={6}
              whiteSpace="nowrap"
            >
              🎸 Genre Analysis
            </Tab>
            <Tab
              _selected={{
                bg: selectedTabBg,
                color: 'white',
                fontWeight: 'bold',
              }}
              fontWeight="medium"
              px={6}
              whiteSpace="nowrap"
            >
              🎤 Top Artists
            </Tab>
            <Tab
              _selected={{
                bg: selectedTabBg,
                color: 'white',
                fontWeight: 'bold',
              }}
              fontWeight="medium"
              px={6}
              whiteSpace="nowrap"
            >
              🎧 Top Tracks
            </Tab>
            <Tab
              _selected={{
                bg: selectedTabBg,
                color: 'white',
                fontWeight: 'bold',
              }}
              fontWeight="medium"
              px={6}
              whiteSpace="nowrap"
            >
              📅 Listening History
            </Tab>
            <Tab
              _selected={{
                bg: selectedTabBg,
                color: 'white',
                fontWeight: 'bold',
              }}
              fontWeight="medium"
              px={6}
              whiteSpace="nowrap"
            >
              💿 Library
            </Tab>
            <Tab
              _selected={{
                bg: selectedTabBg,
                color: 'white',
                fontWeight: 'bold',
              }}
              fontWeight="medium"
              px={6}
              whiteSpace="nowrap"
            >
              🎮 Playback Insights
            </Tab>
            <Tab
              _selected={{
                bg: selectedTabBg,
                color: 'white',
                fontWeight: 'bold',
              }}
              fontWeight="medium"
              px={6}
              whiteSpace="nowrap"
            >
              💎 Recommendations
            </Tab>
            <Tab
              _selected={{
                bg: selectedTabBg,
                color: 'white',
                fontWeight: 'bold',
              }}
              fontWeight="medium"
              px={6}
              whiteSpace="nowrap"
            >
              📋 Playlist Analytics
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <OverviewTab data={analyticsData} />
            </TabPanel>

            <TabPanel p={0}>
              <AudioFeaturesTab data={analyticsData} />
            </TabPanel>

            <TabPanel p={0}>
              <GenreAnalysisTab data={analyticsData} />
            </TabPanel>

            <TabPanel p={0}>
              <TopArtistsTab data={analyticsData} />
            </TabPanel>

            <TabPanel p={0}>
              <TopTracksTab data={analyticsData} />
            </TabPanel>

            <TabPanel p={0}>
              <ListeningHistoryTab data={analyticsData} />
            </TabPanel>

            <TabPanel p={0}>
              <LibraryTab data={analyticsData} />
            </TabPanel>

            <TabPanel p={0}>
              <PlaybackInsightsTab data={analyticsData} />
            </TabPanel>

            <TabPanel p={0}>
              <RecommendationsTab data={analyticsData} />
            </TabPanel>

            <TabPanel p={0}>
              <PlaylistAnalyticsTab data={analyticsData} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
}
