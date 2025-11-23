'use client';

import { useSession, signOut } from 'next-auth/react';
import {
  Box,
  Flex,
  Button,
  Heading,
  Container,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <Box bg="whiteAlpha.100" borderBottom="1px" borderColor="whiteAlpha.200">
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <Heading
            size="md"
            bgGradient="linear(to-r, spotify.green, green.400)"
            bgClip="text"
            cursor="pointer"
            onClick={() => router.push(session ? '/dashboard' : '/')}
          >
            Metricify
          </Heading>

          {session && (
            <Menu>
              <MenuButton>
                <Avatar
                  size="sm"
                  name={session.user?.name || 'User'}
                  src={session.user?.image || undefined}
                  cursor="pointer"
                />
              </MenuButton>
              <MenuList bg="gray.800" borderColor="whiteAlpha.300">
                <MenuItem bg="gray.800" _hover={{ bg: 'whiteAlpha.200' }} isDisabled>
                  {session.user?.name}
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  bg="gray.800"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  onClick={() => router.push('/dashboard')}
                >
                  Dashboard
                </MenuItem>
                <MenuItem
                  bg="gray.800"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  onClick={() => signOut({ callbackUrl: '/' })}
                  color="red.400"
                >
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      </Container>
    </Box>
  );
}
