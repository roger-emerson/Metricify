'use client';

import TopTracks from '@/components/dashboard/TopTracks';
import { VStack, Tabs, TabList, TabPanels, Tab, TabPanel, Text } from '@chakra-ui/react';

export default function TopTracksTab({ data }: any) {
  return (
    <VStack spacing={6} align="stretch">
      <Text fontSize="2xl" fontWeight="bold">Your Top Tracks</Text>
      <Tabs variant="soft-rounded" colorScheme="green">
        <TabList mb={4}>
          <Tab>Last 4 Weeks</Tab>
          <Tab>Last 6 Months</Tab>
          <Tab>All Time</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0}>
            <TopTracks tracks={data.topTracks.short} />
          </TabPanel>
          <TabPanel p={0}>
            <TopTracks tracks={data.topTracks.medium} />
          </TabPanel>
          <TabPanel p={0}>
            <TopTracks tracks={data.topTracks.long} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
}
