import { Box, Heading, Text, VStack, Container, Icon } from '@chakra-ui/react';
import { FaFileContract } from 'react-icons/fa';

export default function Terms() {
  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="2xl">
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" color="blue.600" textAlign="center">
            <Icon as={FaFileContract} mr={2} />利用規約
          </Heading>
          <Text fontSize="lg" color="gray.700">
            RunMap（以下「当サイト」といいます）の利用にあたり、以下の規約に同意いただきます。
          </Text>
          <VStack spacing={4} align="stretch">
            <Text fontWeight="bold">1. サービス内容</Text>
            <Text>当サイトはマラソン大会情報の検索・管理サービスを提供します。</Text>
            <Text fontWeight="bold">2. 禁止事項</Text>
            <Text>不正アクセス、虚偽情報の登録、他者への迷惑行為は禁止します。</Text>
            <Text fontWeight="bold">3. 免責事項</Text>
            <Text>当サイトの情報の正確性・完全性について保証しません。利用による損害について一切責任を負いません。</Text>
            <Text fontWeight="bold">4. 規約の変更</Text>
            <Text>必要に応じて本規約を変更することがあります。変更後の内容は本ページにて告知します。</Text>
            <Text fontWeight="bold">5. お問い合わせ</Text>
            <Text>規約に関するご質問は <a href="/contact" style={{ color: '#3182ce', fontWeight: 'bold' }}>お問い合わせ</a> よりご連絡ください。</Text>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
} 