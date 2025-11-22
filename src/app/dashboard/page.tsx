'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Grid,
  Heading,
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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from '@chakra-ui/react';
import { SpotifyUser, SpotifyArtist, SpotifyTrack, RecentlyPlayed } from '@/types/spotify';
import TopArtists from '@/components/dashboard/TopArtists';
import TopTracks from '@/components/dashboard/TopTracks';
import RecentlyPlayedTracks from '@/components/dashboard/RecentlyPlayedTracks';
import GenreDistribution from '@/components/dashboard/GenreDistribution';
import ListeningStats from '@/components/dashboard/ListeningStats';

interface DashboardData {
  user: SpotifyUser;
  topArtistsShort: SpotifyArtist[];
  topArtistsMedium: SpotifyArtist[];
  topArtistsLong: SpotifyArtist[];
  topTracksShort: SpotifyTrack[];
  topTracksMedium: SpotifyTrack[];
  topTracksLong: SpotifyTrack[];
  recentlyPlayed: RecentlyPlayed[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/spotify/dashboard');

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
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
          <Text>Loading your Spotify stats...</Text>
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
        </VStack>
      </Container>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* User Profile Header */}
        <Flex align="center" gap={6} p={6} bg="whiteAlpha.100" borderRadius="xl">
          <Avatar
            size="xl"
            name={data.user.display_name}
            src={data.user.images[0]?.url}
          />
          <Box>
            <Heading size="lg" mb={2}>
              Welcome back, {data.user.display_name}!
            </Heading>
            <Text color="gray.400">
              {data.user.followers.total.toLocaleString()} followers on Spotify
            </Text>
          </Box>
        </Flex>

        {/* Listening Statistics Overview */}
        <ListeningStats
          topArtists={data.topArtistsMedium}
          topTracks={data.topTracksMedium}
          recentlyPlayed={data.recentlyPlayed}
        />

        {/* Genre Distribution */}
        <GenreDistribution artists={data.topArtistsMedium} />

        {/* Top Artists with Time Range Tabs */}
        <Box>
          <Heading size="md" mb={4}>
            Your Top Artists
          </Heading>
          <Tabs variant="soft-rounded" colorScheme="green">
            <TabList mb={4}>
              <Tab>Last 4 Weeks</Tab>
              <Tab>Last 6 Months</Tab>
              <Tab>All Time</Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={0}>
                <TopArtists artists={data.topArtistsShort} />
              </TabPanel>
              <TabPanel p={0}>
                <TopArtists artists={data.topArtistsMedium} />
              </TabPanel>
              <TabPanel p={0}>
                <TopArtists artists={data.topArtistsLong} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        {/* Top Tracks with Time Range Tabs */}
        <Box>
          <Heading size="md" mb={4}>
            Your Top Tracks
          </Heading>
          <Tabs variant="soft-rounded" colorScheme="green">
            <TabList mb={4}>
              <Tab>Last 4 Weeks</Tab>
              <Tab>Last 6 Months</Tab>
              <Tab>All Time</Tab>
            </TabList>
            <TabPanels>
              <TabPanel p={0}>
                <TopTracks tracks={data.topTracksShort} />
              </TabPanel>
              <TabPanel p={0}>
                <TopTracks tracks={data.topTracksMedium} />
              </TabPanel>
              <TabPanel p={0}>
                <TopTracks tracks={data.topTracksLong} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        {/* Recently Played */}
        <Box>
          <Heading size="md" mb={4}>
            Recently Played
          </Heading>
          <RecentlyPlayedTracks tracks={data.recentlyPlayed} />
        </Box>
      </VStack>
    </Container>
  );
}
