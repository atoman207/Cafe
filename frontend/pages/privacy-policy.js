import { Box, Heading, Text, VStack, Container, Icon } from '@chakra-ui/react';
import { FaShieldAlt } from 'react-icons/fa';

export default function PrivacyPolicy() {
  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="2xl">
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" color="blue.600" textAlign="center">
            <Icon as={FaShieldAlt} mr={2} />プライバシーポリシー
          </Heading>
          <Text fontSize="lg" color="gray.700">
            RunMap（以下「当サイト」といいます）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。
          </Text>
          <VStack spacing={4} align="stretch">
            <Text fontWeight="bold">1. 収集する情報</Text>
            <Text>当サイトは、ユーザー登録やお問い合わせ時に、氏名・メールアドレス等の個人情報を取得します。</Text>
            <Text fontWeight="bold">2. 利用目的</Text>
            <Text>取得した個人情報は、サービス提供・サポート・お知らせ等の目的で利用します。</Text>
            <Text fontWeight="bold">3. 第三者提供</Text>
            <Text>法令に基づく場合を除き、本人の同意なく第三者に提供しません。</Text>
            <Text fontWeight="bold">4. 安全管理</Text>
            <Text>個人情報の漏洩・滅失・毀損の防止に努めます。</Text>
            <Text fontWeight="bold">5. お問い合わせ</Text>
            <Text>プライバシーに関するご質問は <a href="/contact" style={{ color: '#3182ce', fontWeight: 'bold' }}>お問い合わせ</a> よりご連絡ください。</Text>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
} 