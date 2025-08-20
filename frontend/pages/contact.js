import { Box, Heading, Text, VStack, Container, Icon, FormControl, FormLabel, Input, Textarea, Button, useToast } from '@chakra-ui/react';
import { FaEnvelope } from 'react-icons/fa';
import { useState } from 'react';
import axios from 'axios';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/contact', { name, email, message });
      toast({
        title: 'お問い合わせを送信しました',
        description: 'サポートチームよりご連絡いたします。',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      toast({
        title: '送信に失敗しました',
        description: err.response?.data?.message || 'サーバーエラーが発生しました',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="2xl">
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="xl" color="blue.600" textAlign="center">
            <Icon as={FaEnvelope} mr={2} />お問い合わせ
          </Heading>
          <Text fontSize="lg" color="gray.700" textAlign="center">
            ご質問やご要望がございましたら、以下のフォームよりご連絡ください。
          </Text>
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel>お名前</FormLabel>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="お名前" size="lg" disabled={loading} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>メールアドレス</FormLabel>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" size="lg" disabled={loading} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>お問い合わせ内容</FormLabel>
                <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="ご質問・ご要望" rows={5} size="lg" disabled={loading} />
              </FormControl>
              <Button type="submit" colorScheme="blue" size="lg" w="full" isLoading={loading} loadingText="送信中...">
                送信
              </Button>
            </VStack>
          </form>
        </VStack>
      </Container>
    </Box>
  );
} 