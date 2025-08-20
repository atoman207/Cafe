import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import {
  Box, Heading, Text, Spinner, Table, Thead, Tbody, Tr, Th, Td, Input, Button, VStack, HStack, Link as ChakraLink, useColorModeValue, Checkbox, CheckboxGroup, Stack, IconButton, Skeleton, Badge, Image as ChakraImage, Select, Alert, AlertIcon, useToast, Tooltip
} from '@chakra-ui/react';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';

function groupEventsByMonth(events) {
  const groups = {};
  events.forEach(event => {
    if (!event.date) return;
    const date = new Date(event.date);
    const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    if (!groups[monthKey]) groups[monthKey] = [];
    groups[monthKey].push(event);
  });
  return groups;
}

const raceTypes = [
  { key: 'fiveKm', label: '5km' },
  { key: 'tenKm', label: '10km' },
  { key: 'half', label: 'ハーフ' },
  { key: 'full', label: 'マラソン' },
  { key: 'ultra', label: 'ウルトラ' },
  { key: 'elementary', label: '小学生' },
  { key: 'parent', label: '親子' },
  { key: 'timed', label: '時間走' },
  { key: 'relay', label: '駅伝' },
  { key: 'trail', label: 'トレイル' },
];

const defaultNoResultsImg = 'https://undraw.co/api/illustrations/undraw_empty_re_opql.svg';

export default function EventsPage() {
  const router = useRouter();
  const toast = useToast();
  const { cityId, cityName } = router.query;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [membershipStatus, setMembershipStatus] = useState('free');

  // Filters
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRaceTypes, setSelectedRaceTypes] = useState([]);

  // Sorting
  const [sortField, setSortField] = useState('date'); // 'date', 'name', 'location'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc', 'desc'

  // 1. Reset to page 1 when filters or sort options change
  useEffect(() => { setCurrentPage(1); }, [name, location, startDate, endDate, selectedRaceTypes, sortField, sortDirection]);

  // Fetch events when filters or page changes
  useEffect(() => {
    if (!cityId) return;
    setLoading(true);
    setError('');
    const params = { cityId, page: currentPage, limit };
    if (name) params.name = name;
    if (location) params.location = location;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    (selectedRaceTypes || []).forEach(type => { params[type] = true; });
    api.get('/events/by-city-date', { params })
      .then(res => {
        setEvents(res.data.events || res.data); // support both array and paginated object
        setTotalPages(res.data.totalPages || 1);
      })
      .catch(() => setError('大会リストの取得に失敗しました'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [cityId, name, location, startDate, endDate, selectedRaceTypes, currentPage, limit]);

  // Fetch favorites on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await api.get('/user/favorites');
        // Each favorite has Event or eventId
        setFavoriteIds(res.data.map(f => f.eventId || (f.Event && f.Event.id)));
      } catch (err) {
        // ignore
      }
    };
    fetchFavorites();
  }, []);

  // Fetch membership status on mount
  useEffect(() => {
    const fetchMembership = async () => {
      try {
        const res = await api.get('/user/profile');
        setMembershipStatus(res.data.membershipStatus || 'free');
      } catch (err) {
        setMembershipStatus('free');
      }
    };
    fetchMembership();
  }, []);

  // When the user clicks the search button, immediately update debounced filters and reset page
  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const clearFilters = () => {
    setName('');
    setLocation('');
    setStartDate('');
    setEndDate('');
    setSelectedRaceTypes([]);
    setCurrentPage(1);
  };

  // Highlight active filters
  const activeFilters = [
    name && { label: `大会名: ${name}` },
    location && { label: `開催地: ${location}` },
    startDate && { label: `開始日: ${startDate}` },
    endDate && { label: `終了日: ${endDate}` },
    ...selectedRaceTypes.map(type => ({ label: raceTypes.find(r => r.key === type)?.label })),
  ].filter(Boolean);

  // Sorting logic
  const sortedEvents = [...events].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'date') {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'location') {
      comparison = a.location.localeCompare(b.location);
    }
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Remove frontend slicing for pagination
  // Use backend totalPages for pagination controls if available
  // When currentPage changes, fetch new data from backend
  const totalFilteredEvents = sortedEvents.length;
  const totalPagesToShow = Math.max(1, Math.ceil(totalFilteredEvents / limit));

  return (
    <Box maxW="1200px" mx="auto" mt={10}>
      <Heading as="h2" size="lg" mb={6}>
        {cityName ? `${cityName}のマラソン大会一覧` : '大会一覧'}
      </Heading>
      <Text mb={4}>ご覧になりたい大会をクリックしてください</Text>
      {/* Sticky Filters Bar */}
      <Box mb={6} position="sticky" top="0" zIndex={10} p={4} bg={useColorModeValue('gray.50', 'gray.800')} borderRadius="md" boxShadow="sm">
        <VStack align="start" spacing={4}>
          <HStack spacing={4} w="100%">
            <Input aria-label="大会名" placeholder="大会名" value={name} onChange={e => setName(e.target.value)} width="200px" />
            <Input aria-label="開催地" placeholder="開催地" value={location} onChange={e => setLocation(e.target.value)} width="200px" />
            <Input aria-label="開始日" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} width="160px" />
            <Text>～</Text>
            <Input aria-label="終了日" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} width="160px" />
            <Button colorScheme="blue" aria-label="検索" onClick={handleSearch}>検索</Button>
            <Button colorScheme="gray" aria-label="フィルターをクリア" onClick={clearFilters}>クリア</Button>
          </HStack>
          <CheckboxGroup value={selectedRaceTypes} onChange={setSelectedRaceTypes}>
            <Stack direction="row" spacing={4} wrap="wrap">
              {raceTypes.map(type => (
                <Checkbox key={type.key} value={type.key}>{type.label}</Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
          {/* Active Filters Badges */}
          <HStack spacing={2} flexWrap="wrap">
            {activeFilters.map((f, i) => (
              <Badge key={i} colorScheme="blue" px={2} py={1} borderRadius="md">{f.label}</Badge>
            ))}
          </HStack>
        </VStack>
      </Box>
      {loading ? (
        <Box minH="240px" display="flex" alignItems="center" justifyContent="center">
          <Spinner size="xl" color="blue.500" />
        </Box>
      ) : error ? (
        <Alert status="error" borderRadius="md" mt={4}>
          <AlertIcon />
          {error}
        </Alert>
      ) : (
        <Box overflowX="auto">
          {sortedEvents.length === 0 ? (
            <VStack py={10} spacing={4} w="100%">
              <ChakraImage src={defaultNoResultsImg} alt="No results" boxSize="120px" />
              <Text fontSize="lg" color="gray.500">
                該当する大会がありません
              </Text>
            </VStack>
          ) : Object.entries(groupEventsByMonth(sortedEvents)).map(([month, monthEvents], monthIdx) => (
            <Box key={month} mb={8}>
              <Box bg={useColorModeValue('gray.100', 'gray.700')} px={2} py={1} borderRadius="md" mb={2} fontWeight="bold">{month}の大会</Box>
              <Box overflowX="auto">
                <Table variant="simple" size="sm" sx={{ minWidth: '900px' }}>
                  <Thead bg="blue.900" position="sticky" top={0} zIndex={1}>
                    <Tr>
                      <Th color="white" onClick={() => setSortField('date')} cursor="pointer" _hover={{ textDecoration: 'underline' }}>
                        開催日 {sortField === 'date' && sortDirection === 'asc' ? '↑' : sortField === 'date' && sortDirection === 'desc' ? '↓' : ''}
                      </Th>
                      <Th color="white" onClick={() => setSortField('name')} cursor="pointer" _hover={{ textDecoration: 'underline' }}>
                        大会名 {sortField === 'name' && sortDirection === 'asc' ? '↑' : sortField === 'name' && sortDirection === 'desc' ? '↓' : ''}
                      </Th>
                      <Th color="white" onClick={() => setSortField('location')} cursor="pointer" _hover={{ textDecoration: 'underline' }}>
                        開催地 {sortField === 'location' && sortDirection === 'asc' ? '↑' : sortField === 'location' && sortDirection === 'desc' ? '↓' : ''}
                      </Th>
                      <Th color="white">5km</Th>
                      <Th color="white">10km</Th>
                      <Th color="white">ハーフ</Th>
                      <Th color="white">マラソン</Th>
                      <Th color="white">ウルトラ</Th>
                      <Th color="white">小学生</Th>
                      <Th color="white">親子</Th>
                      <Th color="white">時間走</Th>
                      <Th color="white">駅伝</Th>
                      <Th color="white">トレイル</Th>
                      <Th color="white">お気に入り</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {monthEvents.map((event, eventIdx) => (
                      <motion.tr
                        key={event.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * eventIdx, duration: 0.5, type: 'spring' }}
                        style={{
                          background: 'white',
                          borderRadius: '12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                          marginBottom: '8px',
                          cursor: 'pointer',
                          transition: 'box-shadow 0.2s, transform 0.2s',
                        }}
                        whileHover={{
                          boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
                        }}
                      >
                        <Td>{event.date ? event.date.slice(0, 10) : ''}</Td>
                        <Td>
                          <Link href={`${event.link_url}`} passHref>
                            <ChakraLink color="blue.700" fontWeight="bold">{event.name}</ChakraLink>
                          </Link>
                        </Td>
                        <Td>{event.location || (event.City && event.City.name) || ''}</Td>
                        <Td>{event.fiveKm ? '◯' : ''}</Td>
                        <Td>{event.tenKm ? '◯' : ''}</Td>
                        <Td>{event.half ? '◯' : ''}</Td>
                        <Td>{event.full ? '◯' : ''}</Td>
                        <Td>{event.ultra ? '◯' : ''}</Td>
                        <Td>{event.elementary ? '◯' : ''}</Td>
                        <Td>{event.parent ? '◯' : ''}</Td>
                        <Td>{event.timed ? '◯' : ''}</Td>
                        <Td>{event.relay ? '◯' : ''}</Td>
                        <Td>{event.trail ? '◯' : ''}</Td>
                        <Td>
                          <Tooltip label={membershipStatus !== 'paid' && membershipStatus !== 'admin' ? 'プレミアム会員のみ利用可能' : ''} hasArrow isDisabled={membershipStatus === 'paid' || membershipStatus === 'admin'}>
                            <Button
                              size="xs"
                              colorScheme={favoriteIds.includes(event.id) ? 'red' : 'blue'}
                              isDisabled={membershipStatus !== 'paid' && membershipStatus !== 'admin'}
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (favoriteIds.includes(event.id)) {
                                  // Remove from favorites
                                  try {
                                    await api.delete(`/user/favorites/${event.id}`);
                                    setFavoriteIds(favoriteIds.filter(id => id !== event.id));
                                    toast({ title: 'お気に入りから削除しました', status: 'info', duration: 1500 });
                                  } catch (err) {
                                    toast({ title: 'お気に入り削除失敗', status: 'error', duration: 1500 });
                                  }
                                } else {
                                  // Add to favorites
                                  try {
                                    await api.post('/user/favorites', { eventId: event.id });
                                    setFavoriteIds([...favoriteIds, event.id]);
                                    toast({ title: 'お気に入りに追加しました', status: 'success', duration: 1500 });
                                  } catch (err) {
                                    toast({ title: 'お気に入り追加失敗', status: 'error', duration: 1500 });
                                  }
                                }
                              }}
                            >
                              {favoriteIds.includes(event.id) ? 'お気に入り削除' : 'お気に入り追加'}
                            </Button>
                          </Tooltip>
                        </Td>
                      </motion.tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          ))}
          {/* Pagination Controls */}
          <Box mt={6} display="flex" justifyContent="center" alignItems="center">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
              mr={2}
              aria-label="前のページ"
            >
              前へ
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                colorScheme={currentPage === i + 1 ? 'blue' : 'gray'}
                variant={currentPage === i + 1 ? 'solid' : 'outline'}
                mx={1}
                aria-label={`ページ${i + 1}`}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
              ml={2}
              aria-label="次のページ"
            >
              次へ
            </Button>
          </Box>
          <Select width="80px" value={limit} onChange={e => { setLimit(Number(e.target.value)); setCurrentPage(1); }} aria-label="表示件数">
            {[1, 10, 20, 30, 40, 50].map(n => <option key={n} value={n}>{n}件</option>)}
          </Select>
        </Box>
      )}
    </Box>
  );
} 