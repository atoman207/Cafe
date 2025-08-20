import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import { fontFamily } from '../utils/fonts';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  InputLeftElement,
  Heading,
  Text,
  Alert,
  AlertIcon,
  Link,
  VStack,
  HStack,
  useToast,
  Container,
  Card,
  CardBody,
  CardHeader,
  Icon,
  useColorModeValue,
  useBreakpointValue,
  Image,
  Badge,
  Flex,
  Spinner,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { 
  FaEye, 
  FaEyeSlash, 
  FaEnvelope, 
  FaLock, 
  FaSignInAlt, 
  FaUserPlus, 
  FaRunning,
  FaShieldAlt,
  FaMobile,
  FaDesktop,
  FaHeart,
  FaBell,
  FaArrowRight
} from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  // Responsive design values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  const validate = () => {
    if (!email) return 'メールアドレスが必要です';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return '有効なメールアドレスを入力してください';
    if (!password) return 'パスワードが必要です';
    if (password.length < 8 || password.length > 30) return 'パスワードは8〜30文字で入力してください';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('isLoggedIn', 'true');
      toast({ 
        title: 'ログインに成功しました！', 
        description: 'RunMapへようこそ！',
        status: 'success', 
        duration: 3000, 
        isClosable: true 
      });
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg={bgColor} py={10}>
      <Container maxW="lg" centerContent>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          style={{ width: '100%' }}
        >
          <Card
            bg={cardBg}
            shadow="2xl"
            border="1px"
            borderColor={borderColor}
            w="full"
            maxW="2xl"
            _hover={{ shadow: '2xl' }}
            transition="all 0.3s ease"
          >
            <CardHeader pb={4}>
              <VStack spacing={3}>
                <Icon as={FaSignInAlt} boxSize={10} color="blue.500" />
                <Heading size="lg" color={textColor} fontWeight="bold" textAlign="center">
                  ログイン
                </Heading>
                <Text fontSize="md" color={mutedTextColor} textAlign="center">
                  メールアドレスとパスワードでログインしてください
                </Text>
              </VStack>
            </CardHeader>
            <CardBody pt={0}>
              {error && (
                <Alert status="error" mb={4} borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              <form onSubmit={handleSubmit} autoComplete="on">
                <VStack spacing={6}>
                  <FormControl isRequired>
                    <FormLabel color={textColor} fontWeight="medium">
                      メールアドレス
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={FaEnvelope} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        size="lg"
                        bg="white"
                        borderColor={borderColor}
                        borderRadius="xl"
                        _focus={{ 
                          borderColor: 'blue.500', 
                          boxShadow: '0 0 0 2px #3182ce',
                          bg: 'white'
                        }}
                        _hover={{ borderColor: 'blue.300' }}
                        autoFocus
                      />
                    </InputGroup>
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel color={textColor} fontWeight="medium">
                      パスワード
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={FaLock} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="8〜30文字で入力"
                        size="lg"
                        bg="white"
                        borderColor={borderColor}
                        borderRadius="xl"
                        _focus={{ 
                          borderColor: 'blue.500', 
                          boxShadow: '0 0 0 2px #3182ce',
                          bg: 'white'
                        }}
                        _hover={{ borderColor: 'blue.300' }}
                      />
                      <InputRightElement>
                        <Tooltip label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}>
                          <IconButton
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(v => !v)}
                            color="gray.500"
                            _hover={{ color: 'blue.500' }}
                          />
                        </Tooltip>
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    w="full"
                    isLoading={loading}
                    loadingText="ログイン中..."
                    leftIcon={<FaSignInAlt />}
                    rightIcon={<FaArrowRight />}
                    borderRadius="full"
                    fontSize="xl"
                    shadow="md"
                    as={motion.button}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    _hover={{ bg: 'blue.600', shadow: 'xl' }}
                    transition="all 0.2s"
                  >
                    ログイン
                  </Button>
                  <HStack justify="center" w="full">
                    <Text color={mutedTextColor} fontSize="md">アカウントをお持ちでない方は</Text>
                    <NextLink href="/register" passHref legacyBehavior>
                      <Button as="a" variant="link" colorScheme="blue" fontWeight="bold" fontSize="md">
                        新規登録
                      </Button>
                    </NextLink>
                  </HStack>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
} 