import { Badge, Tooltip } from '@chakra-ui/react';
import { FaCrown, FaUser } from 'react-icons/fa';

export default function MembershipBadge({ membershipStatus, size = 'md' }) {
  const getBadgeProps = () => {
    switch (membershipStatus) {
      case 'paid':
        return {
          colorScheme: 'gold',
          icon: FaCrown,
          text: 'プレミアム',
          tooltip: 'プレミアムメンバー - すべての機能にアクセス可能'
        };
      case 'admin':
        return {
          colorScheme: 'purple',
          icon: FaCrown,
          text: '管理者',
          tooltip: '管理者 - 完全なアクセス権限'
        };
      default:
        return {
          colorScheme: 'gray',
          icon: FaUser,
          text: '無料',
          tooltip: '無料メンバー - プレミアム機能にアップグレード'
        };
    }
  };

  const { colorScheme, icon: Icon, text, tooltip } = getBadgeProps();

  return (
    <Tooltip label={tooltip} hasArrow>
      <Badge
        colorScheme={colorScheme}
        size={size}
        display="flex"
        alignItems="center"
        gap={1}
        px={2}
        py={1}
        borderRadius="full"
      >
        <Icon size="0.8em" />
        {text}
      </Badge>
    </Tooltip>
  );
} 