import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Image,
  Text,
  Link as ChakraLink,
  useToast,
  Container,
  Button,
  HStack,
  VStack,
  useColorModeValue,
  useBreakpointValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Switch,
  Tooltip,
  Badge,
  Avatar,
  Divider,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  List,
  ListItem,
  ListIcon,
  Icon
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  FaUser,
  FaPage4,
  FaSignInAlt,
  FaSignOutAlt,
  FaCreditCard,
  FaBell,
  FaHome,
  FaBars,
  FaCrown,
  FaCog,
  FaHeart,
  FaRunning,
  FaEnvelope
} from 'react-icons/fa';
import api from '../utils/api';

export default function Layout({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState('free');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();


  // Responsive design values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  
  // Font family configuration
  const fontFamily = {
    heading: "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'Takao', 'IPAexGothic', 'IPAPGothic', 'VL PGothic', 'Osaka', 'MS PGothic', 'Andale Mono', 'Arial', sans-serif",
    body: "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'Takao', 'IPAexGothic', 'IPAPGothic', 'VL PGothic', 'Osaka', 'MS PGothic', 'Andale Mono', 'Arial', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace"
  };

  // Helper to get auth header
  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Sync isLoggedIn state with localStorage and route changes
  useEffect(() => {
    const checkLogin = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
    };
    checkLogin();
    router.events?.on && router.events.on('routeChangeComplete', checkLogin);
    return () => {
      router.events?.off && router.events.off('routeChangeComplete', checkLogin);
    };
  }, [router.events]);

  // Fetch user profile when logged in
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile', { headers: getAuthHeader() });
        setUserProfile(res.data);
        setNotificationsEnabled(res.data.notificationEnabled);
        setMembershipStatus(res.data.membershipStatus);
        
        // Debug log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('User Profile:', res.data);
          console.log('Membership Status:', res.data.membershipStatus);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setUserProfile(null);
        setNotificationsEnabled(false);
        setMembershipStatus('free');
      }
    };
    if (isLoggedIn) fetchProfile();
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    setUserProfile(null);
    toast({
      title: 'ログアウトしました',
      status: 'info',
      duration: 2000,
    });
    router.push('/');
  };

  const handleNotificationToggle = async () => {
    if (membershipStatus !== 'paid' && membershipStatus !== 'admin') {
      toast({
        title: 'プレミアム会員が必要です',
        description: '通知機能はプレミアム会員のみ利用できます',
        status: 'info',
        duration: 3000,
      });
      router.push('/payment');
      return;
    }

    // For admin users, show a toast that they can use the feature
    if (membershipStatus === 'admin') {
      toast({
        title: '管理者権限でアクセス',
        description: '管理者として通知機能を利用できます',
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }

    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);

    try {
      const res = await api.put(
        '/user/notifications/toggle',
        { enabled: newState },
        { headers: getAuthHeader() }
      );
      if (res.data.notificationEnabled !== undefined) {
        setNotificationsEnabled(res.data.notificationEnabled);
      }
      toast({
        title: '通知設定を更新しました',
        status: 'success',
        duration: 2000,
      });
    } catch (err) {
      setNotificationsEnabled(!newState);
      toast({
        title: '通知設定の更新に失敗しました',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const NavigationItems = () => {
    // Check if user is admin (both from state and profile)
    const isAdmin = isLoggedIn && (membershipStatus === 'admin' || userProfile?.membershipStatus === 'admin');
    
    return (
      <HStack spacing={6} align="center">
        <ChakraLink
          as={Link}
          href="/"
          color={textColor}
          fontWeight="500"
          display="flex"
          alignItems="center"
          gap={2}
          _hover={{ color: 'blue.500', transform: 'translateY(-1px)' }}
          transition="all 0.2s"
        >
          <Icon as={FaHome} />
          <Text display={{ base: 'none', md: 'block' }}>ホーム</Text>
        </ChakraLink>

        {isLoggedIn && (
          <ChakraLink
            as={Link}
            href="/mypage"
            color={textColor}
            fontWeight="500"
            display="flex"
            alignItems="center"
            gap={2}
            _hover={{ color: 'blue.500', transform: 'translateY(-1px)' }}
            transition="all 0.2s"
          >
            <Icon as={FaPage4} />
            <Text display={{ base: 'none', md: 'block' }}>マイページ</Text>
          </ChakraLink>
        )}

        {isLoggedIn && (
          <ChakraLink
            as={Link}
            href="/send-mail"
            color={textColor}
            fontWeight="500"
            display="flex"
            alignItems="center"
            gap={2}
            _hover={{ color: 'blue.500', transform: 'translateY(-1px)' }}
            transition="all 0.2s"
          >
            <Icon as={FaEnvelope} />
            <Text display={{ base: 'none', md: 'block' }}>Send Email</Text>
          </ChakraLink>
        )}

        {isAdmin && (
          <ChakraLink
            as={Link}
            href="/admin"
            color={textColor}
            fontWeight="500"
            display="flex"
            alignItems="center"
            gap={2}
            _hover={{ color: 'purple.500', transform: 'translateY(-1px)' }}
            transition="all 0.2s"
          >
            <Icon as={FaCog} />
            <Text display={{ base: 'none', md: 'block' }}>管理画面</Text>
          </ChakraLink>
        )}
      </HStack>
    );
  };

  return (
    <Box 
      minH="100vh" 
      bg={useColorModeValue('gray.50', 'gray.900')} 
      display="flex" 
      flexDirection="column"
      fontFamily={fontFamily.body}
    >
      {/* Header */}
      <Box
        as="nav"
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex={1000}
        backdropFilter="blur(10px)"
      >
        <Container maxW="container.xl">
          <Flex align="center" justify="space-between" py={4}>
            {/* Logo */}
            <ChakraLink as={Link} href="/" _hover={{ textDecoration: 'none' }}>
              <Flex align="center" gap={3} cursor="pointer" _hover={{ transform: 'scale(1.02)' }} transition="transform 0.2s">
                <Box position="relative">
                  <Image
                    src="/image/_1.png"
                    alt="RunMap Logo"
                    boxSize="40px"
                    borderRadius="full"
                    border="2px"
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
                  <Heading size="md" color="blue.600" fontWeight="bold" fontFamily={fontFamily.heading}>
                    RunMap
                  </Heading>
                  <Text fontSize="xs" color={mutedTextColor} fontWeight="medium" fontFamily={fontFamily.body}>
                    マラソン大会検索
                  </Text>
                </VStack>
              </Flex>
            </ChakraLink>

            {/* Desktop Navigation */}
            <Flex align="center" gap={4} display={{ base: 'none', md: 'flex' }}>
              <NavigationItems />

              {/* User Menu */}
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  color={textColor}
                  _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                  leftIcon={isLoggedIn ? <Avatar size="sm" name={userProfile?.username} /> : <FaUser />}
                >
                  {isLoggedIn ? (
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="medium">{userProfile?.username}</Text>
                      <HStack spacing={1}>
                        <Badge
                          colorScheme={membershipStatus === 'paid' ? 'green' : membershipStatus === 'admin' ? 'purple' : 'gray'}
                          variant="subtle"
                          size="xs"
                        >
                          {membershipStatus === 'paid' ? 'プレミアム' : membershipStatus === 'admin' ? '管理者' : '無料'}
                        </Badge>
                        {notificationsEnabled && (
                          <Badge colorScheme="blue" variant="subtle" size="xs">
                            <Icon as={FaBell} boxSize={2} />
                          </Badge>
                        )}
                      </HStack>
                    </VStack>
                  ) : (
                    <Text>ログイン</Text>
                  )}
                </MenuButton>
                <MenuList>
                  {isLoggedIn ? (
                    <>
                      <MenuItem icon={<FaPage4 />} onClick={() => router.push('/mypage')}>
                        マイページ
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem icon={<FaCreditCard />} onClick={() => router.push('/payment')}>
                        プレミアム会員
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout}>
                        ログアウト
                      </MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem icon={<FaSignInAlt />} onClick={() => router.push('/login')}>
                        ログイン
                      </MenuItem>
                      <MenuItem icon={<FaUser />} onClick={() => router.push('/register')}>
                        新規登録
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem icon={<FaCreditCard />} onClick={() => router.push('/payment')}>
                        プレミアム会員
                      </MenuItem>
                    </>
                  )}
                </MenuList>
              </Menu>
            </Flex>

            {/* Mobile Menu Button */}
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              aria-label="Open menu"
              icon={<FaBars />}
              variant="ghost"
              color={textColor}
              onClick={onOpen}
            />
          </Flex>
        </Container>
      </Box>

      {/* Mobile Navigation Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Flex align="center" gap={3}>
              <Image src="/image/_1.png" alt="Logo" boxSize="32px" borderRadius="full" />
              <Text fontWeight="bold">RunMap</Text>
            </Flex>
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch" pt={4}>
              <NavigationItems />
              <Divider />

              {isLoggedIn && (
                <VStack align="stretch" spacing={2}>
                  <Text fontSize="sm" fontWeight="medium" color={mutedTextColor}>
                    ユーザー情報
                  </Text>
                  <Box p={3} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                    <Text fontWeight="medium">{userProfile?.username}</Text>
                    <Text fontSize="sm" color={mutedTextColor}>{userProfile?.email}</Text>
                    <HStack mt={2} spacing={2}>
                      <Badge
                        colorScheme={membershipStatus === 'paid' ? 'green' : membershipStatus === 'admin' ? 'purple' : 'gray'}
                        variant="subtle"
                      >
                        {membershipStatus === 'paid' ? 'プレミアム' : membershipStatus === 'admin' ? '管理者' : '無料'}
                      </Badge>
                      {notificationsEnabled && (
                        <Badge colorScheme="blue" variant="subtle">
                          <Icon as={FaBell} mr={1} />
                          通知ON
                        </Badge>
                      )}
                    </HStack>
                  </Box>
                </VStack>
              )}

              <Divider />

              <VStack align="stretch" spacing={2}>
                {!isLoggedIn && (
                  <>
                    <Button
                      variant="ghost"
                      justifyContent="start"
                      leftIcon={<FaSignInAlt />}
                      onClick={() => {
                        onClose();
                        router.push('/login');
                      }}
                    >
                      ログイン
                    </Button>
                    <Button
                      variant="ghost"
                      justifyContent="start"
                      leftIcon={<FaUser />}
                      onClick={() => {
                        onClose();
                        router.push('/register');
                      }}
                    >
                      新規登録
                    </Button>
                  </>
                )}

                {isLoggedIn && (membershipStatus === 'admin' || userProfile?.membershipStatus === 'admin') && (
                  <Button
                    variant="ghost"
                    justifyContent="start"
                    leftIcon={<FaCog />}
                    onClick={() => {
                      onClose();
                      router.push('/admin');
                    }}
                    color="purple.500"
                    _hover={{ bg: 'purple.50' }}
                  >
                    管理画面
                  </Button>
                )}

                {isLoggedIn && (
                  <Button
                    variant="ghost"
                    justifyContent="start"
                    leftIcon={<FaEnvelope />}
                    onClick={() => {
                      onClose();
                      router.push('/send-mail');
                    }}
                  >
                    Send Email
                  </Button>
                )}

                {isLoggedIn && (
                  <Button
                    variant="ghost"
                    justifyContent="start"
                    leftIcon={<FaSignOutAlt />}
                    onClick={() => {
                      onClose();
                      handleLogout();
                    }}
                  >
                    ログアウト
                  </Button>
                )}
              </VStack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box flex={1}>
        {children}
      </Box>

      {/* Footer */}
      <Box
        as="footer"
        bg={bgColor}
        borderTop="1px"
        borderColor={borderColor}
        py={8}
        mt="auto"
      >
        <Container maxW="container.xl">
          <VStack spacing={6}>
            <HStack spacing={8} wrap="wrap" justify="center">
              <VStack align="start" spacing={2}>
                <HStack>
                  <Icon as={FaRunning} color="blue.500" />
                  <Text fontWeight="bold" color={textColor} fontFamily={fontFamily.heading}>RunMap</Text>
                </HStack>
                <Text fontSize="sm" color={mutedTextColor} maxW="200px" fontFamily={fontFamily.body}>
                  マラソン大会検索サイト。あなたの完走をサポートします。
                </Text>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold" color={textColor} fontFamily={fontFamily.heading}>サービス</Text>
                <VStack align="start" spacing={1}>
                  <ChakraLink as={Link} href="/" color={mutedTextColor} fontSize="sm" _hover={{ color: 'blue.500' }} fontFamily={fontFamily.body}>
                    イベント検索
                  </ChakraLink>
                  <ChakraLink as={Link} href="/mypage" color={mutedTextColor} fontSize="sm" _hover={{ color: 'blue.500' }} fontFamily={fontFamily.body}>
                    マイページ
                  </ChakraLink>
                  <ChakraLink as={Link} href="/payment" color={mutedTextColor} fontSize="sm" _hover={{ color: 'blue.500' }} fontFamily={fontFamily.body}>
                    プレミアム会員
                  </ChakraLink>
                </VStack>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold" color={textColor} fontFamily={fontFamily.heading}>サポート</Text>
                <VStack align="start" spacing={1}>
                  <ChakraLink as={Link} href="/help" color={mutedTextColor} fontSize="sm" _hover={{ color: 'blue.500' }} fontFamily={fontFamily.body}>
                    ヘルプセンター
                  </ChakraLink>
                  <ChakraLink as={Link} href="/contact" color={mutedTextColor} fontSize="sm" _hover={{ color: 'blue.500' }} fontFamily={fontFamily.body}>
                    お問い合わせ
                  </ChakraLink>
                  <ChakraLink as={Link} href="/faq" color={mutedTextColor} fontSize="sm" _hover={{ color: 'blue.500' }} fontFamily={fontFamily.body}>
                    よくある質問
                  </ChakraLink>
                </VStack>
              </VStack>

              <VStack align="start" spacing={2}>
                <Text fontWeight="bold" color={textColor} fontFamily={fontFamily.heading}>法的情報</Text>
                <VStack align="start" spacing={1}>
                  <ChakraLink as={Link} href="/privacy-policy" color={mutedTextColor} fontSize="sm" _hover={{ color: 'blue.500' }} fontFamily={fontFamily.body}>
                    プライバシーポリシー
                  </ChakraLink>
                  <ChakraLink as={Link} href="/terms" color={mutedTextColor} fontSize="sm" _hover={{ color: 'blue.500' }} fontFamily={fontFamily.body}>
                    利用規約
                  </ChakraLink>
                </VStack>
              </VStack>
            </HStack>

            <Divider />

            <Text color={mutedTextColor} fontSize="sm" textAlign="center" fontFamily={fontFamily.body}>
              &copy; {new Date().getFullYear()} RunMap. すべての権利を留保します。
            </Text>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}
