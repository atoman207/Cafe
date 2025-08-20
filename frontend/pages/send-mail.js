import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Heading,
  useToast,
  Container,
  VStack,
} from '@chakra-ui/react';
import api from '../utils/api';

export default function SendMailPage() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(to, subject, message);
    try {
      await api.post('/contact/send-mail', {
        to: to,
        subject: subject,
        message: message,
      }).then((res) => {
        toast({
          title: res.data.message,
          status: 'success',
          duration: 3000,
        });
      }).catch((err) => {
        toast({
          title: err.response?.data?.message || err.message,
          status: 'error',
          duration: 4000,
        });
      });
      setTo('');
      setSubject('');
      setMessage('');
    } catch (err) {
      toast({
        title: 'Failed to send email',
        description: err.response?.data?.message || err.message,
        status: 'error',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" py={10}>
      <Box p={8} borderWidth={1} borderRadius="lg" boxShadow="md" bg="white">
        <Heading as="h1" size="lg" mb={6} textAlign="center">
          Send Email
        </Heading>
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>To</FormLabel>
              <Input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Recipient email address"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Subject</FormLabel>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Message</FormLabel>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
              />
            </FormControl>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={loading}
              loadingText="Sending"
              width="full"
              mt={2}
            >
              Send
            </Button>
          </VStack>
        </form>
      </Box>
    </Container>
  );
} 