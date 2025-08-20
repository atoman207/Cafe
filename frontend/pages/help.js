import { Box, Heading, Text, VStack, Container, Icon, Link as ChakraLink, List, ListItem } from '@chakra-ui/react';
import { FaQuestionCircle, FaEnvelope, FaBook, FaShieldAlt, FaFileContract } from 'react-icons/fa';
import NextLink from 'next/link';

export default function Help() {
  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="2xl">
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" color="blue.600" textAlign="center">
            <Icon as={FaQuestionCircle} mr={2} />ヘルプセンター
          </Heading>
          <Text fontSize="lg" color="gray.700" textAlign="center">
            RunMapの使い方やよくある質問、サポート情報はこちらからご確認いただけます。
          </Text>
          <List spacing={4} fontSize="lg">
            <ListItem>
              <ChakraLink as={NextLink} href="/faq" color="blue.500" fontWeight="bold">
                <Icon as={FaBook} mr={2} />よくある質問（FAQ）
              </ChakraLink>
            </ListItem>
            <ListItem>
              <ChakraLink as={NextLink} href="/contact" color="blue.500" fontWeight="bold">
                <Icon as={FaEnvelope} mr={2} />お問い合わせ
              </ChakraLink>
            </ListItem>
            <ListItem>
              <ChakraLink as={NextLink} href="/privacy-policy" color="blue.500" fontWeight="bold">
                <Icon as={FaShieldAlt} mr={2} />プライバシーポリシー
              </ChakraLink>
            </ListItem>
            <ListItem>
              <ChakraLink as={NextLink} href="/terms" color="blue.500" fontWeight="bold">
                <Icon as={FaFileContract} mr={2} />利用規約
              </ChakraLink>
            </ListItem>
          </List>
        </VStack>
      </Container>
    </Box>
  );
} 