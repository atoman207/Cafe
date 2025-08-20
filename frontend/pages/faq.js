import { Box, Heading, Text, VStack, Container, Icon } from '@chakra-ui/react';
import { FaBook } from 'react-icons/fa';

export default function FAQ() {
  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="2xl">
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" color="blue.600" textAlign="center">
            <Icon as={FaBook} mr={2} />よくある質問（FAQ）
          </Heading>
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontWeight="bold" fontSize="lg" color="gray.800">Q. RunMapの利用は無料ですか？</Text>
              <Text color="gray.700">A. 基本機能は無料でご利用いただけます。プレミアム会員になると、さらに多くの機能がご利用可能です。</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" fontSize="lg" color="gray.800">Q. イベントのお気に入り登録はどうやって行いますか？</Text>
              <Text color="gray.700">A. イベント一覧ページで「お気に入り追加」ボタンをクリックすると登録できます。プレミアム会員のみ利用可能です。</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" fontSize="lg" color="gray.800">Q. パスワードを忘れた場合は？</Text>
              <Text color="gray.700">A. ログインページの「パスワードを忘れた場合」リンクから再設定できます。</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" fontSize="lg" color="gray.800">Q. サポートに連絡したい場合は？</Text>
              <Text color="gray.700">A. <a href="/contact" style={{ color: '#3182ce', fontWeight: 'bold' }}>お問い合わせ</a>ページからご連絡ください。</Text>
            </Box>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
} 