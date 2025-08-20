import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Flex,
  useToast,
  Alert,
  AlertIcon,
  Divider,
  Badge,
  List,
  ListItem,
  ListIcon,
  Card,
  CardBody,
  CardHeader,
  Container,
  Spinner,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  useBreakpointValue,
  Icon,
  Image,
  Grid,
  GridItem,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow
} from '@chakra-ui/react';
import { 
  FaCheck, 
  FaStar, 
  FaCreditCard, 
  FaShieldAlt, 
  FaLock, 
  FaBell, 
  FaHeart, 
  FaCrown,
  FaRunning,
  FaUsers,
  FaTrophy,
  FaArrowRight,
  FaCheckCircle
} from 'react-icons/fa';
import api from '../utils/api';

// Stripeの読み込み（公開キーに置き換えてください）
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// 決済フォームコンポーネント
function PaymentForm({ pricing, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  // Responsive design values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 決済インテントの作成
      const paymentIntentResponse = await api.post('/payment/create-payment-intent', {
        amount: pricing.premium.price,
        currency: pricing.premium.currency
      });

      const { clientSecret, paymentIntentId } = paymentIntentResponse.data;

      // カード決済の確認
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            // 郵便番号の問題を避けるためのデフォルト請求詳細
            address: {
              postal_code: '12345' // テスト用のデフォルト郵便番号
            }
          }
        }
      });

      if (stripeError) {
        // Stripeエラーメッセージを日本語に翻訳
        let errorMessage = stripeError.message;
        if (errorMessage.includes('Your card number is incomplete')) {
          errorMessage = 'カード番号が不完全です';
        } else if (errorMessage.includes('Your card\'s expiration date is incomplete')) {
          errorMessage = 'カードの有効期限が不完全です';
        } else if (errorMessage.includes('Your card\'s security code is incomplete')) {
          errorMessage = 'カードのセキュリティコードが不完全です';
        } else if (errorMessage.includes('Your card was declined')) {
          errorMessage = 'カードが拒否されました';
        } else if (errorMessage.includes('Your card has insufficient funds')) {
          errorMessage = 'カードの残高が不足しています';
        } else if (errorMessage.includes('Your card has expired')) {
          errorMessage = 'カードの有効期限が切れています';
        }
        setError(errorMessage);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // バックエンドで決済を確認
        await api.post('/payment/confirm-payment', {
          paymentIntentId: paymentIntentId
        });

        toast({
          title: '決済に成功しました！',
          description: 'プレミアムメンバーシップにアップグレードされました。',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || '決済に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: textColor,
        '::placeholder': {
          color: mutedTextColor,
        },
        backgroundColor: cardBg,
      },
      invalid: {
        color: '#e53e3e',
      },
    },
    hidePostalCode: false, // 郵便番号フィールドを表示
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <Box>
          <HStack mb={3}>
            <Icon as={FaCreditCard} color="blue.500" />
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              決済情報
            </Text>
          </HStack>
          <Box
            border="2px"
            borderColor={borderColor}
            borderRadius="lg"
            p={4}
            bg={cardBg}
            _focusWithin={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
            transition="all 0.2s"
          >
            <CardElement options={cardElementOptions} />
          </Box>
        </Box>

        {error && (
          <Alert 
            status="error" 
            borderRadius="lg"
            variant="subtle"
            border="1px"
            borderColor="red.200"
          >
            <AlertIcon />
            <Box>
              <AlertTitle>決済エラー</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Box>
          </Alert>
        )}

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          isLoading={loading}
          loadingText="決済処理中..."
          disabled={!stripe}
          leftIcon={loading ? <Spinner size="sm" /> : <FaCreditCard />}
          rightIcon={!loading && <FaArrowRight />}
          _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
          transition="all 0.2s"
        >
          ¥{pricing.premium.price.toLocaleString()}を支払う
        </Button>

        <VStack spacing={2} textAlign="center">
          <HStack spacing={2} color={mutedTextColor}>
            <Icon as={FaShieldAlt} />
            <Text fontSize="sm">お支払い情報は暗号化され、安全に処理されます</Text>
          </HStack>
          <Text fontSize="xs" color={mutedTextColor}>
            決済にはStripeを使用しています
          </Text>
        </VStack>
      </VStack>
    </form>
  );
}

// メイン決済ページコンポーネント
export default function PaymentPage() {
  const [membershipStatus, setMembershipStatus] = useState('free');
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();
  const router = useRouter();

  // Responsive design values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ユーザープロフィールの取得（トークンはapiユーティリティによって自動的に含まれます）
        const profileRes = await api.get('/user/profile');
        setMembershipStatus(profileRes.data.membershipStatus);

        // 価格情報の取得
        const pricingRes = await api.get('/payment/pricing');
        setPricing(pricingRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          // ログインしていない場合、ログインページにリダイレクト
          router.push('/login');
          return;
        }
        setError('決済情報の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handlePaymentSuccess = () => {
    setMembershipStatus('paid');
    // オプション：遅延後にホームページにリダイレクト
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  if (loading) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" align="center" justify="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color={mutedTextColor}>決済情報を読み込み中...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxW="container.md" py={10}>
        <Alert 
          status="error" 
          borderRadius="lg"
          variant="subtle"
          border="1px"
          borderColor="red.200"
        >
          <AlertIcon />
          <Box>
            <AlertTitle>エラーが発生しました</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      </Container>
    );
  }

  if (membershipStatus === 'paid' || membershipStatus === 'admin') {
    return (
      <Box minH="100vh" bg={bgColor} py={{ base: 4, md: 8 }}>
        <Container maxW="container.md">
          <Card 
            bg={cardBg} 
            shadow="xl" 
            border="1px" 
            borderColor={borderColor}
            textAlign="center"
            _hover={{ shadow: '2xl' }}
            transition="all 0.3s ease"
          >
            <CardBody py={12}>
              <VStack spacing={6}>
                <Box position="relative">
                  <Icon as={membershipStatus === 'admin' ? FaShieldAlt : FaCrown} boxSize={16} color={membershipStatus === 'admin' ? 'purple.500' : 'yellow.500'} />
                  <Badge 
                    position="absolute" 
                    top="-2" 
                    right="-2" 
                    colorScheme={membershipStatus === 'admin' ? 'purple' : 'green'} 
                    variant="solid" 
                    size="sm"
                    borderRadius="full"
                  >
                    <Icon as={FaCheck} boxSize={2} />
                  </Badge>
                </Box>
                <VStack spacing={2}>
                  <Heading size="lg" color={textColor}>
                    {membershipStatus === 'admin' ? '管理者' : 'プレミアムメンバー'}
                  </Heading>
                  <Text fontSize="lg" color={membershipStatus === 'admin' ? 'purple.500' : 'green.500'} fontWeight="medium">
                    {membershipStatus === 'admin' ? '管理者としてすべての機能を利用できます！' : 'すでにプレミアムメンバーです！'}
                  </Text>
                  <Text color={mutedTextColor}>
                    {membershipStatus === 'admin' ? '管理者権限により、支払いなしでプレミアム機能を利用できます' : 'すべてのプレミアム機能を利用できます'}
                  </Text>
                </VStack>
                <Button 
                  colorScheme="blue" 
                  size="lg"
                  onClick={() => router.push('/')}
                  leftIcon={<FaRunning />}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.2s"
                >
                  ホームに戻る
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} py={{ base: 4, md: 8 }}>
      <Container maxW="container.xl">
        <VStack spacing={8}>
          {/* Header Section */}
          <VStack spacing={4} textAlign="center" maxW="3xl">
            <Flex align="center" gap={3}>
              <Box position="relative">
                <Image 
                  src="/image/_1.png" 
                  alt="RunMap Logo" 
                  boxSize={{ base: "48px", md: "64px" }} 
                  borderRadius="full"
                  border="3px"
                  borderColor="blue.500"
                />
                <Badge 
                  position="absolute" 
                  top="-2" 
                  right="-2" 
                  colorScheme="green" 
                  variant="solid" 
                  size="sm"
                  borderRadius="full"
                >
                  <Icon as={FaRunning} boxSize={2} />
                </Badge>
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size={{ base: "lg", md: "xl" }} color="blue.600" fontWeight="bold">
                  RunMap
                </Heading>
                <Text fontSize={{ base: "sm", md: "md" }} color={mutedTextColor} fontWeight="medium">
                  マラソン大会検索サイト
                </Text>
              </VStack>
            </Flex>
            <VStack spacing={2}>
              <Heading size={{ base: "xl", md: "2xl" }} color={textColor}>
                プレミアムにアップグレード
              </Heading>
              <Text fontSize={{ base: "md", md: "lg" }} color={mutedTextColor} maxW="2xl">
                プレミアム機能をアンロックして、今後のイベントの通知を受け取り、
                より快適なマラソン大会検索体験を楽しもう
              </Text>
            </VStack>
          </VStack>

          {/* Pricing and Payment Section */}
          <Grid 
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }} 
            gap={8} 
            w="full"
            maxW="6xl"
          >
            {/* 価格カード */}
            <Card 
              bg={cardBg} 
              shadow="xl" 
              border="1px" 
              borderColor={borderColor}
              _hover={{ shadow: '2xl' }}
              transition="all 0.3s ease"
              position="relative"
              overflow="hidden"
            >
              {/* Premium Badge */}
              <Badge
                position="absolute"
                top={4}
                right={4}
                colorScheme="green"
                variant="solid"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="sm"
              >
                最も人気
              </Badge>
              
              <CardHeader pb={4}>
                <VStack spacing={3}>
                  <Icon as={FaCrown} boxSize={12} color="yellow.500" />
                  <Heading size="lg" color={textColor}>プレミアムメンバーシップ</Heading>
                  <Text color={mutedTextColor} textAlign="center">
                    すべての機能を利用できる年間プラン
                  </Text>
                </VStack>
              </CardHeader>
              
              <CardBody pt={0}>
                <VStack spacing={6}>
                  <Box textAlign="center" w="full">
                    <Text fontSize="4xl" fontWeight="bold" color="blue.500" lineHeight="1">
                      ¥{pricing?.premium?.price?.toLocaleString()}
                    </Text>
                    <Text color={mutedTextColor} fontSize="lg">年間</Text>
                    <Text fontSize="sm" color={mutedTextColor}>
                      月額 ¥{(pricing?.premium?.price / 12).toLocaleString()} 相当
                    </Text>
                  </Box>

                  <Divider />

                  <VStack spacing={4} align="stretch" w="full">
                    <Text fontWeight="bold" color={textColor} fontSize="lg">
                      含まれる機能
                    </Text>
                    <List spacing={3}>
                      {pricing?.premium?.features?.map((feature, index) => (
                        <ListItem key={index}>
                          <HStack spacing={3}>
                            <Icon as={FaCheckCircle} color="green.500" boxSize={4} />
                            <Text color={textColor}>{feature}</Text>
                          </HStack>
                        </ListItem>
                      ))}
                    </List>
                  </VStack>

                  {/* Stats */}
                  <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
                    <Stat textAlign="center">
                      <StatLabel color={mutedTextColor}>利用者数</StatLabel>
                      <StatNumber color="blue.500">1,234</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        23.36%
                      </StatHelpText>
                    </Stat>
                    <Stat textAlign="center">
                      <StatLabel color={mutedTextColor}>満足度</StatLabel>
                      <StatNumber color="green.500">98%</StatNumber>
                      <StatHelpText>
                        <Icon as={FaStar} color="yellow.500" />
                        4.9/5
                      </StatHelpText>
                    </Stat>
                  </Grid>
                </VStack>
              </CardBody>
            </Card>

            {/* 決済フォーム */}
            <Card 
              bg={cardBg} 
              shadow="xl" 
              border="1px" 
              borderColor={borderColor}
              _hover={{ shadow: '2xl' }}
              transition="all 0.3s ease"
            >
              <CardHeader pb={4}>
                <VStack spacing={2}>
                  <Icon as={FaCreditCard} boxSize={8} color="blue.500" />
                  <Heading size="md" color={textColor}>決済詳細</Heading>
                  <Text fontSize="sm" color={mutedTextColor} textAlign="center">
                    安全な決済でプレミアム機能をアンロック
                  </Text>
                </VStack>
              </CardHeader>
              
              <CardBody pt={0}>
                {pricing && (
                  <Elements stripe={stripePromise}>
                    <PaymentForm 
                      pricing={pricing} 
                      onSuccess={handlePaymentSuccess}
                    />
                  </Elements>
                )}
              </CardBody>
            </Card>
          </Grid>

          {/* Features Comparison */}
          <VStack spacing={6} maxW="4xl" w="full">
            <Heading size="md" color={textColor} textAlign="center">
              プレミアム機能の詳細
            </Heading>
            
            <Grid 
              templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} 
              gap={6} 
              w="full"
            >
              <Card 
                bg={cardBg} 
                shadow="md" 
                border="1px" 
                borderColor={borderColor}
                p={6}
                textAlign="center"
                _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                transition="all 0.3s ease"
              >
                <VStack spacing={4}>
                  <Icon as={FaHeart} boxSize={8} color="red.500" />
                  <Text fontWeight="bold" color={textColor}>お気に入り機能</Text>
                  <Text fontSize="sm" color={mutedTextColor}>
                    気になる大会をお気に入りに登録して、いつでも確認できます
                  </Text>
                </VStack>
              </Card>

              <Card 
                bg={cardBg} 
                shadow="md" 
                border="1px" 
                borderColor={borderColor}
                p={6}
                textAlign="center"
                _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                transition="all 0.3s ease"
              >
                <VStack spacing={4}>
                  <Icon as={FaBell} boxSize={8} color="blue.500" />
                  <Text fontWeight="bold" color={textColor}>通知機能</Text>
                  <Text fontSize="sm" color={mutedTextColor}>
                    大会の申込締切や開始日をメールで通知
                  </Text>
                </VStack>
              </Card>

              <Card 
                bg={cardBg} 
                shadow="md" 
                border="1px" 
                borderColor={borderColor}
                p={6}
                textAlign="center"
                _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                transition="all 0.3s ease"
              >
                <VStack spacing={4}>
                  <Icon as={FaTrophy} boxSize={8} color="yellow.500" />
                  <Text fontWeight="bold" color={textColor}>優先サポート</Text>
                  <Text fontSize="sm" color={mutedTextColor}>
                    プレミアム会員専用のサポートサービス
                  </Text>
                </VStack>
              </Card>
            </Grid>
          </VStack>

          {/* Security Notice */}
          <Card 
            bg={cardBg} 
            shadow="md" 
            border="1px" 
            borderColor={borderColor}
            w="full"
            maxW="2xl"
          >
            <CardBody textAlign="center">
              <VStack spacing={3}>
                <HStack spacing={2}>
                  <Icon as={FaShieldAlt} color="green.500" />
                  <Text fontWeight="bold" color={textColor}>セキュリティ保証</Text>
                </HStack>
                <Text fontSize="sm" color={mutedTextColor}>
                  お支払い情報は安全です。業界標準のSSL暗号化を使用し、
                  カード情報をサーバーに保存することはありません。
                </Text>
                <HStack spacing={4} color={mutedTextColor}>
                  <Icon as={FaLock} />
                  <Text fontSize="xs">256-bit SSL暗号化</Text>
                  <Icon as={FaShieldAlt} />
                  <Text fontSize="xs">PCI DSS準拠</Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}