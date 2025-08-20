import { 
  Box, 
  Heading, 
  Text, 
  Stack, 
  FormControl, 
  FormLabel, 
  Input, 
  Button, 
  Divider, 
  SimpleGrid, 
  Card, 
  CardBody, 
  CardHeader, 
  useToast, 
  Spinner, 
  Alert, 
  AlertIcon,
  VStack,
  HStack,
  Container,
  useColorModeValue,
  useBreakpointValue,
  Icon,
  Image,
  Badge,
  Flex,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  Avatar,
  Progress,
  InputGroup,
  InputLeftElement,
  IconButton,
  Tooltip,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaHeart, 
  FaCrown, 
  FaRunning, 
  FaCalendarAlt, 
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaStar,
  FaUsers,
  FaTrophy,
  FaBell,
  FaShieldAlt,
  FaCheckCircle,
  FaArrowRight,
  FaExternalLinkAlt
} from 'react-icons/fa';
import api from '../utils/api';

const MyPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [profile, setProfile] = useState({});
  const [membership, setMembership] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [appliedEvents, setAppliedEvents] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const toast = useToast();

  // Responsive design values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  // Helper to get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch profile and favorites
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('ログインが必要です');
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/user/profile', { headers: { Authorization: `Bearer ${token}` } });
        setProfile({
          name: res.data.username || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
        });
        setMembership(res.data.membershipStatus || 'free');
        setNotificationsEnabled(res.data.notificationEnabled || false);
        
        // Fetch favorites if paid
        if (res.data.membershipStatus === 'paid' || res.data.membershipStatus === 'admin') {
          const favRes = await api.get('/user/favorites', { headers: { Authorization: `Bearer ${token}` } });
          setFavorites((favRes.data || []).map(f => f.Event || f));
        } else {
          setFavorites([]);
        }

        // Fetch applied events
        try {
          const appliedRes = await api.get('/events/user/applications', { headers: { Authorization: `Bearer ${token}` } });
          setAppliedEvents(appliedRes.data || []);
        } catch (err) {
          // Ignore error for applied events
        }
      } catch (err) {
        setError('ユーザープロフィールの取得に失敗しました');
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const validateProfile = () => {
    if (!profile.name || profile.name.length < 2 || profile.name.length > 20) return 'ユーザー名は2〜20文字で入力してください';
    if (!profile.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(profile.email)) return '有効なメールアドレスを入力してください';
    if (profile.phone && !/^\d{10,15}$/.test(profile.phone)) return '電話番号は10〜15桁の数字で入力してください';
    if (profile.address && (profile.address.length < 3 || profile.address.length > 100)) return '住所は3〜100文字で入力してください';
    return '';
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const validationError = validateProfile();
    if (validationError) {
      setError(validationError);
      setSaving(false);
      return;
    }
    try {
      const payload = {
        username: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
      };
      const res = await api.put('/user/profile/update', payload, { headers: getAuthHeader() });
      toast({ 
        title: 'プロフィールが更新されました', 
        description: '変更が正常に保存されました',
        status: 'success', 
        duration: 3000, 
        isClosable: true 
      });
      // Optionally update membership if changed
      if (res.data.user && res.data.user.membershipStatus) {
        setMembership(res.data.user.membershipStatus);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'プロフィール更新に失敗しました');
    }
    setSaving(false);
  };

  const getMembershipColor = (status) => {
    switch (status) {
      case 'paid': return 'green';
      case 'admin': return 'purple';
      default: return 'gray';
    }
  };

  const getMembershipText = (status) => {
    switch (status) {
      case 'paid': return 'プレミアム会員';
      case 'admin': return '管理者';
      default: return '無料会員';
    }
  };

  const getDaysUntilEvent = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    const diffTime = event - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Box minH="100vh" bg={bgColor} display="flex" align="center" justify="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color={mutedTextColor}>プロフィールを読み込み中...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} py={{ base: 4, md: 8 }}>
      <Container maxW="container.xl">
        <VStack spacing={8}>
          {/* Header Section */}
          <VStack spacing={4} textAlign="center" maxW="2xl">
            <Flex align="center" gap={3}>
              <Box position="relative">
                <Avatar 
                  size={{ base: "lg", md: "xl" }} 
                  name={profile.name} 
                  bg="blue.500"
                  color="white"
                  border="3px"
                  borderColor="blue.500"
                />
                <Badge 
                  position="absolute" 
                  bottom="-2" 
                  right="-2" 
                  colorScheme={getMembershipColor(membership)}
                  variant="solid" 
                  size="sm"
                  borderRadius="full"
                >
                  <Icon as={membership === 'paid' ? FaCrown : FaUser} boxSize={2} />
                </Badge>
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size={{ base: "lg", md: "xl" }} color={textColor} fontWeight="bold">
                  {profile.name || 'ユーザー'}
                </Heading>
                <Text fontSize={{ base: "sm", md: "md" }} color={mutedTextColor} fontWeight="medium">
                  {getMembershipText(membership)}
                </Text>
              </VStack>
            </Flex>
            <Text fontSize={{ base: "md", md: "lg" }} color={mutedTextColor} maxW="md">
              あなたのプロフィールとマラソン大会の管理
            </Text>
          </VStack>

          {/* Stats Overview */}
          <Grid 
            templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} 
            gap={6} 
            w="full"
            maxW="4xl"
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
              <VStack spacing={3}>
                <Icon as={FaHeart} boxSize={8} color="red.500" />
                <Stat>
                  <StatNumber color="red.500">{favorites.length}</StatNumber>
                  <StatLabel color={mutedTextColor}>お気に入り</StatLabel>
                </Stat>
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
              <VStack spacing={3}>
                <Icon as={FaCheckCircle} boxSize={8} color="green.500" />
                <Stat>
                  <StatNumber color="green.500">{appliedEvents.length}</StatNumber>
                  <StatLabel color={mutedTextColor}>申込済み</StatLabel>
                </Stat>
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
              <VStack spacing={3}>
                <Icon as={FaBell} boxSize={8} color="blue.500" />
                <Stat>
                  <StatNumber color="blue.500">
                    {notificationsEnabled ? 'ON' : 'OFF'}
                  </StatNumber>
                  <StatLabel color={mutedTextColor}>通知設定</StatLabel>
                </Stat>
              </VStack>
            </Card>
          </Grid>

          {/* Main Content Grid */}
          <Grid 
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }} 
            gap={8} 
            w="full"
            maxW="6xl"
          >
            {/* Profile Management */}
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
                  <Icon as={FaUser} boxSize={8} color="blue.500" />
                  <Heading size="md" color={textColor}>プロフィール管理</Heading>
                  <Text fontSize="sm" color={mutedTextColor} textAlign="center">
                    個人情報の更新と管理
                  </Text>
                </VStack>
              </CardHeader>
              
              <CardBody pt={0}>
                {error && (
                  <Alert 
                    status="error" 
                    mb={6}
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
                )}
                
                <form onSubmit={handleProfileSave}>
                  <VStack spacing={6}>
                    <FormControl>
                      <FormLabel color={textColor} fontWeight="medium">ユーザー名</FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <Icon as={FaUser} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          name="name"
                          value={profile.name}
                          onChange={handleProfileChange}
                          placeholder="ユーザー名を入力"
                          size="lg"
                          bg="white"
                          borderColor={borderColor}
                          _focus={{ 
                            borderColor: 'blue.500', 
                            boxShadow: '0 0 0 1px #3182ce',
                            bg: 'white'
                          }}
                          _hover={{ borderColor: 'blue.300' }}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textColor} fontWeight="medium">メールアドレス</FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <Icon as={FaEnvelope} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          name="email"
                          type="email"
                          value={profile.email}
                          onChange={handleProfileChange}
                          placeholder="example@email.com"
                          size="lg"
                          bg="white"
                          borderColor={borderColor}
                          _focus={{ 
                            borderColor: 'blue.500', 
                            boxShadow: '0 0 0 1px #3182ce',
                            bg: 'white'
                          }}
                          _hover={{ borderColor: 'blue.300' }}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textColor} fontWeight="medium">電話番号</FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <Icon as={FaPhone} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          name="phone"
                          value={profile.phone}
                          onChange={handleProfileChange}
                          placeholder="090-1234-5678"
                          size="lg"
                          bg="white"
                          borderColor={borderColor}
                          _focus={{ 
                            borderColor: 'blue.500', 
                            boxShadow: '0 0 0 1px #3182ce',
                            bg: 'white'
                          }}
                          _hover={{ borderColor: 'blue.300' }}
                        />
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <FormLabel color={textColor} fontWeight="medium">住所</FormLabel>
                      <InputGroup>
                        <InputLeftElement>
                          <Icon as={FaMapMarkerAlt} color="gray.400" />
                        </InputLeftElement>
                        <Input
                          name="address"
                          value={profile.address}
                          onChange={handleProfileChange}
                          placeholder="東京都渋谷区..."
                          size="lg"
                          bg="white"
                          borderColor={borderColor}
                          _focus={{ 
                            borderColor: 'blue.500', 
                            boxShadow: '0 0 0 1px #3182ce',
                            bg: 'white'
                          }}
                          _hover={{ borderColor: 'blue.300' }}
                        />
                      </InputGroup>
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      w="full"
                      isLoading={saving}
                      loadingText="保存中..."
                      leftIcon={saving ? <Spinner size="sm" /> : <FaSave />}
                      rightIcon={!saving && <FaArrowRight />}
                      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                      transition="all 0.2s"
                    >
                      プロフィールを保存
                    </Button>
                  </VStack>
                </form>
              </CardBody>
            </Card>

            {/* Membership Status */}
            <VStack spacing={6} align="stretch">
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
                    <Icon as={FaCrown} boxSize={8} color="yellow.500" />
                    <Heading size="md" color={textColor}>メンバーシップ</Heading>
                    <Text fontSize="sm" color={mutedTextColor} textAlign="center">
                      現在の会員ステータスと特典
                    </Text>
                  </VStack>
                </CardHeader>
                
                <CardBody pt={0}>
                  <VStack spacing={4}>
                    <Badge 
                      colorScheme={getMembershipColor(membership)} 
                      variant="solid" 
                      px={4} 
                      py={2} 
                      fontSize="lg"
                      borderRadius="full"
                    >
                      {getMembershipText(membership)}
                    </Badge>
                    
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-between">
                        <Text color={mutedTextColor}>お気に入り機能</Text>
                        <Icon 
                          as={membership === 'paid' || membership === 'admin' ? FaCheckCircle : FaUser} 
                          color={membership === 'paid' || membership === 'admin' ? 'green.500' : 'gray.400'} 
                        />
                      </HStack>
                      <HStack justify="space-between">
                        <Text color={mutedTextColor}>通知機能</Text>
                        <Icon 
                          as={membership === 'paid' || membership === 'admin' ? FaCheckCircle : FaUser} 
                          color={membership === 'paid' || membership === 'admin' ? 'green.500' : 'gray.400'} 
                        />
                      </HStack>
                      <HStack justify="space-between">
                        <Text color={mutedTextColor}>優先サポート</Text>
                        <Icon 
                          as={membership === 'paid' || membership === 'admin' ? FaCheckCircle : FaUser} 
                          color={membership === 'paid' || membership === 'admin' ? 'green.500' : 'gray.400'} 
                        />
                      </HStack>
                    </VStack>

                    {membership !== 'paid' && (
                      <Button
                        colorScheme="blue"
                        variant="outline"
                        size="lg"
                        w="full"
                        leftIcon={<FaCrown />}
                        onClick={() => window.location.href = '/payment'}
                        _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                        transition="all 0.2s"
                      >
                        プレミアムにアップグレード
                      </Button>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Applied Events */}
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
                    <Icon as={FaCheckCircle} boxSize={8} color="green.500" />
                    <Heading size="md" color={textColor}>申込済みイベント</Heading>
                    <Text fontSize="sm" color={mutedTextColor} textAlign="center">
                      申し込んだマラソン大会
                    </Text>
                  </VStack>
                </CardHeader>
                
                <CardBody pt={0}>
                  {appliedEvents.length === 0 ? (
                    <VStack spacing={4} py={6}>
                      <Icon as={FaCalendarAlt} boxSize={12} color="gray.400" />
                      <Text color={mutedTextColor} textAlign="center">
                        申し込んだイベントがありません
                      </Text>
                      <Text fontSize="sm" color={mutedTextColor} textAlign="center">
                        ホームページでイベントを探して申し込んでみましょう
                      </Text>
                    </VStack>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      {appliedEvents.slice(0, 3).map(event => {
                        const daysUntil = getDaysUntilEvent(event.date);
                        return (
                          <Card key={event.id} bg="gray.50" border="1px" borderColor="gray.200">
                            <CardBody p={4}>
                              <VStack align="stretch" spacing={2}>
                                <HStack justify="space-between">
                                  <Text fontWeight="bold" color={textColor} fontSize="sm">
                                    {event.name}
                                  </Text>
                                  <Badge 
                                    colorScheme={daysUntil < 0 ? 'red' : daysUntil <= 7 ? 'orange' : 'green'} 
                                    variant="subtle" 
                                    size="sm"
                                  >
                                    {daysUntil < 0 ? '終了' : daysUntil === 0 ? '今日' : `${daysUntil}日前`}
                                  </Badge>
                                </HStack>
                                <HStack spacing={2} color={mutedTextColor}>
                                  <Icon as={FaCalendarAlt} boxSize={3} />
                                  <Text fontSize="xs">{event.date?.slice(0, 10)}</Text>
                                </HStack>
                                <HStack spacing={2} color={mutedTextColor}>
                                  <Icon as={FaMapMarkerAlt} boxSize={3} />
                                  <Text fontSize="xs">{event.location}</Text>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        );
                      })}
                      {appliedEvents.length > 3 && (
                        <Text fontSize="sm" color="blue.500" textAlign="center">
                          他 {appliedEvents.length - 3} 件のイベントがあります
                        </Text>
                      )}
                    </VStack>
                  )}
                </CardBody>
              </Card>
            </VStack>
          </Grid>

          {/* Favorite Events */}
          <Card 
            bg={cardBg} 
            shadow="xl" 
            border="1px" 
            borderColor={borderColor}
            w="full"
            _hover={{ shadow: '2xl' }}
            transition="all 0.3s ease"
          >
            <CardHeader pb={4}>
              <VStack spacing={2}>
                <Icon as={FaHeart} boxSize={8} color="red.500" />
                <Heading size="md" color={textColor}>お気に入りイベント</Heading>
                <Text fontSize="sm" color={mutedTextColor} textAlign="center">
                  気になるマラソン大会をお気に入りに登録
                </Text>
              </VStack>
            </CardHeader>
            
            <CardBody pt={0}>
              {membership !== 'paid' && membership !== 'admin' ? (
                <VStack spacing={4} py={8}>
                  <Icon as={FaCrown} boxSize={16} color="yellow.500" />
                  <VStack spacing={2}>
                    <Text fontWeight="bold" color={textColor}>プレミアム会員限定機能</Text>
                    <Text color={mutedTextColor} textAlign="center">
                      お気に入り機能はプレミアム会員のみ利用できます
                    </Text>
                  </VStack>
                  <Button
                    colorScheme="blue"
                    size="lg"
                    leftIcon={<FaCrown />}
                    onClick={() => window.location.href = '/payment'}
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    transition="all 0.2s"
                  >
                    プレミアムにアップグレード
                  </Button>
                </VStack>
              ) : favorites.length === 0 ? (
                <VStack spacing={4} py={8}>
                  <Icon as={FaHeart} boxSize={16} color="gray.400" />
                  <VStack spacing={2}>
                    <Text fontWeight="bold" color={textColor}>お気に入りがありません</Text>
                    <Text color={mutedTextColor} textAlign="center">
                      ホームページで気になるイベントをお気に入りに追加してみましょう
                    </Text>
                  </VStack>
                  <Button
                    colorScheme="blue"
                    variant="outline"
                    leftIcon={<FaExternalLinkAlt />}
                    onClick={() => window.location.href = '/'}
                    _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                    transition="all 0.2s"
                  >
                    イベントを探す
                  </Button>
                </VStack>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {favorites.map(event => {
                    const daysUntil = getDaysUntilEvent(event.date);
                    return (
                      <Card 
                        key={event.id} 
                        bg="gray.50" 
                        border="1px" 
                        borderColor="gray.200"
                        _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                        transition="all 0.3s ease"
                      >
                        <CardHeader pb={2}>
                          <VStack align="stretch" spacing={2}>
                            <HStack justify="space-between">
                              <Badge 
                                colorScheme={daysUntil < 0 ? 'red' : daysUntil <= 7 ? 'orange' : 'green'} 
                                variant="solid" 
                                size="sm"
                              >
                                {daysUntil < 0 ? '終了' : daysUntil === 0 ? '今日' : `${daysUntil}日前`}
                              </Badge>
                              <Icon as={FaHeart} color="red.500" />
                            </HStack>
                            <Heading size="sm" color={textColor} lineHeight="1.3">
                              {event.name}
                            </Heading>
                          </VStack>
                        </CardHeader>
                        <CardBody pt={0}>
                          <VStack align="stretch" spacing={2}>
                            <HStack spacing={2} color={mutedTextColor}>
                              <Icon as={FaCalendarAlt} color="green.500" boxSize={3} />
                              <Text fontSize="xs">{event.date?.slice(0, 10)}</Text>
                            </HStack>
                            <HStack spacing={2} color={mutedTextColor}>
                              <Icon as={FaMapMarkerAlt} color="blue.500" boxSize={3} />
                              <Text fontSize="xs">{event.location}</Text>
                            </HStack>
                            <Text fontSize="xs" color={mutedTextColor} noOfLines={2}>
                              {event.description}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default MyPage; 