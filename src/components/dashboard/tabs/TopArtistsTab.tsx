'use client';

import TopArtists from '@/components/dashboard/TopArtists';
import { VStack, Tabs, TabList, TabPanels, Tab, TabPanel, Text } from '@chakra-ui/react';

export default function TopArtistsTab({ data }: any) {
  return (
    <VStack spacing={6} align="stretch">
      <Text fontSize="2xl" fontWeight="bold">Your Top Artists</Text>
      <Tabs variant="soft-rounded" colorScheme="green">
        <TabList mb={4}>
          <Tab>Last 4 Weeks</Tab>
          <Tab>Last 6 Months</Tab>
          <Tab>All Time</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0}>
            <TopArtists artists={data.topArtists.short} />
          </TabPanel>
          <TabPanel p={0}>
            <TopArtists artists={data.topArtists.medium} />
          </TabPanel>
          <TabPanel p={0}>
            <TopArtists artists={data.topArtists.long} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
}
