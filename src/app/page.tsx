import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Icon,
  Flex,
} from '@chakra-ui/react';

export default function Home() {
  return (
    <Container maxW="container.xl" py={20}>
      <VStack spacing={8} align="center">
        <Box textAlign="center">
          <Heading
            as="h1"
            size="2xl"
            mb={4}
            bgGradient="linear(to-r, spotify.green, green.400)"
            bgClip="text"
          >
            Metricify
          </Heading>
          <Text fontSize="xl" color="gray.400">
            Your Personal Spotify Metrics Dashboard
          </Text>
        </Box>

        <VStack spacing={4} maxW="2xl" textAlign="center">
          <Text fontSize="lg" color="gray.300">
            Discover your listening patterns, explore your favorite artists, and
            dive deep into your Spotify data. Plan your perfect festival
            experience based on your musical preferences.
          </Text>
        </VStack>

        <Flex gap={4} flexWrap="wrap" justify="center">
          <Button
            size="lg"
            colorScheme="green"
            bg="spotify.green"
            _hover={{ bg: '#1ed760' }}
          >
            Connect with Spotify
          </Button>
          <Button size="lg" variant="outline" colorScheme="whiteAlpha">
            Learn More
          </Button>
        </Flex>

        <Box mt={16}>
          <VStack spacing={6}>
            <Heading size="md" color="gray.400">
              Features
            </Heading>
            <Flex gap={8} flexWrap="wrap" justify="center">
              <FeatureCard
                title="Listening Metrics"
                description="Track your listening history and patterns"
              />
              <FeatureCard
                title="Top Artists & Songs"
                description="See your most played music"
              />
              <FeatureCard
                title="Festival Planner"
                description="Plan your festival schedule intelligently"
              />
            </Flex>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Box
      p={6}
      bg="whiteAlpha.100"
      borderRadius="lg"
      maxW="250px"
      _hover={{ bg: 'whiteAlpha.200', transform: 'translateY(-4px)' }}
      transition="all 0.3s"
    >
      <Heading size="sm" mb={2} color="spotify.green">
        {title}
      </Heading>
      <Text fontSize="sm" color="gray.400">
        {description}
      </Text>
    </Box>
  );
}
