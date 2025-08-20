import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
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
  Divider,
  Icon,
  useColorModeValue,
  useBreakpointValue,
  Image,
  Badge,
  Flex,
  Spinner,
  IconButton,
  Tooltip,
  Progress,
  Grid,
  GridItem
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { 
  FaEye, 
  FaEyeSlash, 
  FaEnvelope, 
  FaLock, 
  FaUser, 
  FaPhone, 
  FaMapMarkerAlt,
  FaUserPlus,
  FaRunning,
  FaShieldAlt,
  FaCheckCircle,
  FaArrowRight,
  FaStar
} from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const usernameRef = useRef(null);
  const toast = useToast();

  // Responsive design values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  // Calculate form completion progress
  const formFields = [username, email, password, phone, address];
  const completedFields = formFields.filter(field => field.trim() !== '').length;
  const progressPercentage = (completedFields / formFields.length) * 100;

  const validate = () => {
    if (!username) return 'ユーザー名が必要です';
    if (username.length < 2 || username.length > 20) return 'ユーザー名は2〜20文字で入力してください';
    if (!email) return 'メールアドレスが必要です';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return '有効なメールアドレスを入力してください';
    if (!password) return 'パスワードが必要です';
    if (password.length < 8 || password.length > 30) return 'パスワードは8〜30文字で入力してください';
    if (phone && !/^\d{10,15}$/.test(phone)) return '電話番号は10〜15桁の数字で入力してください';
    if (address && (address.length < 3 || address.length > 100)) return '住所は3〜100文字で入力してください';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      if (usernameRef.current) usernameRef.current.focus();
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', { username, email, password, phone, address });
      setSuccess('登録に成功しました！ログインできます。');
      toast({ 
        title: '登録に成功しました！', 
        description: 'ログインページに移動します',
        status: 'success', 
        duration: 3000, 
        isClosable: true 
      });
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || '登録に失敗しました');
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
                <Icon as={FaUserPlus} boxSize={10} color="blue.500" />
                <Heading size="lg" color={textColor} fontWeight="bold" textAlign="center">
                  新規登録
                </Heading>
                <Text fontSize="md" color={mutedTextColor} textAlign="center">
                  必要な情報を入力してアカウントを作成してください
                </Text>
                {/* Progress Bar */}
                <VStack spacing={2} w="full">
                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color={mutedTextColor}>フォーム完成度</Text>
                    <Text fontSize="sm" fontWeight="medium" color="blue.500">
                      {Math.round(progressPercentage)}%
                    </Text>
                  </HStack>
                  <Progress 
                    value={progressPercentage} 
                    colorScheme="blue" 
                    size="sm" 
                    borderRadius="full"
                    w="full"
                  />
                </VStack>
              </VStack>
            </CardHeader>
            <CardBody pt={0}>
              {error && (
                <Alert status="error" mb={4} borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              {success && (
                <Alert status="success" mb={4} borderRadius="md">
                  <AlertIcon />
                  {success}
                </Alert>
              )}
              <form onSubmit={handleSubmit} autoComplete="on">
                <VStack spacing={6}>
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} w="full">
                    <GridItem>
                      <FormControl isRequired>
                        <FormLabel color={textColor} fontWeight="medium">
                          ユーザー名
                        </FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <Icon as={FaUser} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            ref={usernameRef}
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="ユーザー名を入力"
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
                    </GridItem>
                    <GridItem>
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
                          />
                        </InputGroup>
                      </FormControl>
                    </GridItem>
                  </Grid>
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
                    <Text fontSize="sm" color={mutedTextColor} mt={1}>
                      パスワードは8〜30文字で、英数字を含めてください
                    </Text>
                  </FormControl>
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} w="full">
                    <GridItem>
                      <FormControl>
                        <FormLabel color={textColor} fontWeight="medium">
                          電話番号（任意）
                        </FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <Icon as={FaPhone} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="09012345678"
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
                        </InputGroup>
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      <FormControl>
                        <FormLabel color={textColor} fontWeight="medium">
                          住所（任意）
                        </FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <Icon as={FaMapMarkerAlt} color="gray.400" />
                          </InputLeftElement>
                          <Input
                            type="text"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder="東京都渋谷区..."
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
                        </InputGroup>
                      </FormControl>
                    </GridItem>
                  </Grid>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    w="full"
                    isLoading={loading}
                    loadingText="登録中..."
                    leftIcon={<FaUserPlus />}
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
                    新規登録
                  </Button>
                  <HStack justify="center" w="full">
                    <Text color={mutedTextColor} fontSize="md">すでにアカウントをお持ちですか？</Text>
                    <NextLink href="/login" passHref legacyBehavior>
                      <Button as="a" variant="link" colorScheme="blue" fontWeight="bold" fontSize="md">
                        ログイン
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