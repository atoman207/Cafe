import { useState, useEffect, memo, useMemo } from "react";
import api from "../utils/api";
import { fontFamily } from "../utils/fonts";
import {
  Box,
  Heading,
  Input,
  Button,
  SimpleGrid,
  Text,
  VStack,
  Link as ChakraLink,
  useToast,
  Container,
  Badge,
  Icon,
  useColorModeValue,
  Card,
  CardBody,
  useBreakpointValue,
  Tooltip,
  Alert,
  AlertIcon,
  Skeleton,
} from "@chakra-ui/react";
import Link from "next/link";
import {
  FaMapMarkerAlt,
  FaRunning,
} from "react-icons/fa";
import { useRouter } from "next/router";
import NextImage from "next/image";
import { motion } from 'framer-motion';

export default function Home() {
  const [cities, setCities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/admin/cities-grouped");
        setCities(res.data);
      } catch (err) {
        setError("都道府県リストの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  return (
    <Box minH="100vh" bg={bgColor} pb={10}>
      {/* Hero Section */}
      <Box
        position="relative"
        width="100%"
        maxW="1900px"
        mx="auto"
        mb={8}
        borderRadius="2xl"
        overflow="hidden"
        boxShadow="2xl"
        aspectRatio={{ md: '5/1' }}
        minH={{ base: '220px', md: '340px' }}
        bgGradient="linear(to-r, blue.400, purple.400)"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <NextImage
          src="/image/_1.png"
          alt="Banner Logo"
          layout="fill"
          objectFit="cover"
          priority
          quality={90}
          style={{ opacity: 0.18 }}
        />
        <VStack zIndex={2} spacing={6} w="full" align="center">
          <Heading
            as="h1"
            size={isMobile ? "lg" : "2xl"}
            color="white"
            fontWeight="extrabold"
            textShadow="0 2px 16px rgba(0,0,0,0.25)"
            textAlign="center"
            mt={isMobile ? 8 : 0}
          >
            <Icon as={FaRunning} boxSize={10} color="yellow.300" mr={2} />
            RunMapへようこそ！
          </Heading>
          <Text color="white" fontSize={isMobile ? "md" : "xl"} fontWeight="medium" textAlign="center">
            <Icon as={FaMapMarkerAlt} color="yellow.200" mr={2} />
            日本全国のマラソン大会を探して、お気に入りに登録しよう！
          </Text>
          {/* Removed the yellow search button here */}
        </VStack>
      </Box>

      {/* City Selection Section */}
      <Container maxW="container.xl" mt={10} mb={20}>
        <Heading as="h2" size="lg" mb={6} textAlign={'center'} color={textColor}>
          <Icon as={FaMapMarkerAlt} color="blue.400" mr={2} />
          都道府県別検索
        </Heading>
        <Text mb={4} textAlign={'center'} color={mutedTextColor} fontSize="lg">
          ご覧になりたい都道府県をクリックしてください
        </Text>
        {loading ? (
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing={4}>
            {[...Array(12)].map((_, i) => (
              <Box key={i} p={2}>
                <Skeleton height="100px" borderRadius="xl" />
              </Box>
            ))}
          </SimpleGrid>
        ) : error ? (
          <Alert status="error" borderRadius="md" mt={4}>
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <VStack align="start" spacing={8} w="100%">
            {Object.keys(cities).map((region, regionIdx) => (
              <Box key={region} w="100%">
                <Text fontWeight="bold" mb={1} color="blue.600" fontSize="xl">
                  <Icon as={FaMapMarkerAlt} color="blue.400" mr={2} />
                  {region}
                </Text>
                <SimpleGrid
                  columns={{ base: 2, sm: 3, md: 4, lg: 6 }}
                  spacing={6}
                >
                  {cities[region].map((city, cityIdx) => (
                    <motion.div
                      key={city.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * cityIdx, duration: 0.5, type: 'spring' }}
                    >
                      <Tooltip label={`${city.name}の大会を見る`} hasArrow placement="top">
                        <Link
                          href={{ pathname: "/events", query: { cityId: city.id, cityName: city.name } }}
                          passHref
                        >
                          <Card
                            display="block"
                            p={0}
                            borderRadius="2xl"
                            boxShadow="lg"
                            bg={cardBg}
                            fontWeight="bold"
                            textAlign="center"
                            color="blue.700"
                            _hover={{
                              textDecoration: "none",
                              bg: "blue.50",
                              boxShadow: "2xl",
                              transform: "scale(1.05)",
                            }}
                            transition="all 0.2s"
                          >
                            <CardBody p={4}>
                              <VStack spacing={2}>
                                <Text fontSize="lg" fontWeight="bold" color={textColor}>{city.name}</Text>
                              </VStack>
                            </CardBody>
                          </Card>
                        </Link>
                      </Tooltip>
                    </motion.div>
                  ))}
                </SimpleGrid>
              </Box>
            ))}
          </VStack>
        )}
      </Container>
    </Box>
  );
}
