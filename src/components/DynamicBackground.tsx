'use client';

import { Box } from '@chakra-ui/react';

export default function DynamicBackground() {
  return (
    <>
      {/* Base animated gradient */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={-1}
        background="linear-gradient(-45deg, #0a0e0a, #0f1810, #1a1a1a, #0d1a12)"
        backgroundSize="400% 400%"
        sx={{
          '@keyframes gradient1': {
            '0%, 100%': {
              backgroundPosition: '0% 50%',
            },
            '50%': {
              backgroundPosition: '100% 50%',
            },
          },
          animation: 'gradient1 15s ease infinite',
        }}
      />

      {/* Overlay gradient for depth */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={-1}
        background="linear-gradient(135deg, rgba(29, 185, 84, 0.1), transparent 50%, rgba(30, 215, 96, 0.05))"
        backgroundSize="300% 300%"
        sx={{
          '@keyframes gradient2': {
            '0%, 100%': {
              backgroundPosition: '100% 50%',
            },
            '50%': {
              backgroundPosition: '0% 50%',
            },
          },
          animation: 'gradient2 20s ease infinite',
        }}
      />

      {/* Organic mesh blob 1 - Large top right */}
      <Box
        position="fixed"
        top="-20%"
        right="-10%"
        width="60vw"
        height="60vw"
        maxW="800px"
        maxH="800px"
        borderRadius="40% 50% 60% 50%"
        background="radial-gradient(circle, rgba(29, 185, 84, 0.15), rgba(30, 215, 96, 0.05), transparent)"
        filter="blur(80px)"
        zIndex={-1}
        sx={{
          '@keyframes float1': {
            '0%, 100%': {
              transform: 'translate(0, 0) scale(1)',
              opacity: 0.3,
            },
            '33%': {
              transform: 'translate(30px, -30px) scale(1.1)',
              opacity: 0.4,
            },
            '66%': {
              transform: 'translate(-20px, 20px) scale(0.9)',
              opacity: 0.35,
            },
          },
          animation: 'float1 25s ease-in-out infinite',
        }}
      />

      {/* Organic mesh blob 2 - Medium bottom left */}
      <Box
        position="fixed"
        bottom="-15%"
        left="-5%"
        width="50vw"
        height="50vw"
        maxW="700px"
        maxH="700px"
        borderRadius="50% 40% 50% 60%"
        background="radial-gradient(circle, rgba(30, 215, 96, 0.12), rgba(29, 185, 84, 0.06), transparent)"
        filter="blur(70px)"
        zIndex={-1}
        sx={{
          '@keyframes float2': {
            '0%, 100%': {
              transform: 'translate(0, 0) scale(1) rotate(0deg)',
              opacity: 0.25,
            },
            '33%': {
              transform: 'translate(-40px, 30px) scale(1.15) rotate(120deg)',
              opacity: 0.35,
            },
            '66%': {
              transform: 'translate(25px, -25px) scale(0.95) rotate(240deg)',
              opacity: 0.3,
            },
          },
          animation: 'float2 30s ease-in-out infinite',
        }}
      />

      {/* Organic mesh blob 3 - Small center */}
      <Box
        position="fixed"
        top="40%"
        left="50%"
        transform="translate(-50%, -50%)"
        width="40vw"
        height="40vw"
        maxW="600px"
        maxH="600px"
        borderRadius="60% 50% 40% 50%"
        background="radial-gradient(circle, rgba(23, 168, 74, 0.1), rgba(29, 185, 84, 0.04), transparent)"
        filter="blur(90px)"
        zIndex={-1}
        sx={{
          '@keyframes float3': {
            '0%, 100%': {
              transform: 'translate(-50%, -50%) scale(1)',
              opacity: 0.2,
            },
            '50%': {
              transform: 'translate(calc(-50% + 20px), calc(-50% + 40px)) scale(1.2)',
              opacity: 0.3,
            },
          },
          animation: 'float3 35s ease-in-out infinite',
        }}
      />

      {/* Additional accent blob 1 */}
      <Box
        position="fixed"
        top="20%"
        left="20%"
        width="30vw"
        height="30vw"
        maxW="400px"
        maxH="400px"
        borderRadius="50% 60% 50% 40%"
        background="radial-gradient(circle, rgba(40, 200, 90, 0.08), transparent)"
        filter="blur(60px)"
        zIndex={-1}
        sx={{
          '@keyframes pulse': {
            '0%, 100%': {
              opacity: 0.15,
              transform: 'scale(1)',
            },
            '50%': {
              opacity: 0.25,
              transform: 'scale(1.05)',
            },
          },
          animation: 'pulse 18s ease-in-out infinite',
        }}
      />

      {/* Additional accent blob 2 */}
      <Box
        position="fixed"
        bottom="30%"
        right="25%"
        width="35vw"
        height="35vw"
        maxW="500px"
        maxH="500px"
        borderRadius="40% 50% 60% 50%"
        background="radial-gradient(circle, rgba(25, 175, 80, 0.09), transparent)"
        filter="blur(75px)"
        zIndex={-1}
        sx={{
          '@keyframes pulse2': {
            '0%, 100%': {
              opacity: 0.15,
              transform: 'scale(1)',
            },
            '50%': {
              opacity: 0.25,
              transform: 'scale(1.05)',
            },
          },
          animation: 'pulse2 22s ease-in-out infinite 5s',
        }}
      />

      {/* Subtle grain texture overlay for depth */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={-1}
        opacity={0.03}
        background="url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 /%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 /%3E%3C/svg%3E')"
        pointerEvents="none"
      />
    </>
  );
}
