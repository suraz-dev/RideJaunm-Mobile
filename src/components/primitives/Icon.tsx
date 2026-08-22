/**
 * ============================================================================
 * UNIFIED VECTOR ICON PRIMITIVE (R16)
 * ============================================================================
 *
 * Provides a coherent, 2px stroke rounded vector outline icon family wrapping
 * lucide-react-native. Replaces all emoji and raw text glyphs.
 */

import React from 'react';
import {
  Navigation,
  Compass,
  MapPin,
  MapPinned,
  Route,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Users,
  User,
  UserCheck,
  Layers,
  LocateFixed,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Search,
  Wifi,
  WifiOff,
  Radio,
  Battery,
  BatteryCharging,
  BatteryWarning,
  Check,
  CheckCircle2,
  X,
  XCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Info,
  Calendar,
  Flame,
  CornerUpRight,
  Activity,
  Sparkles,
  Share2,
  Send,
  MessageSquare,
  Mic,
  Volume2,
  Settings,
  Wrench,
  Bike,
  History,
  Lock,
  RefreshCw,
  Clock,
  Gauge,
  Mountain,
  Eye,
  EyeOff,
  DownloadCloud,
  FileText,
  AlertOctagon,
  ArrowRight,
  ArrowUpRight,
  HardDrive,
  Heart,
  Sliders,
  Globe,
  Phone,
  Play,
  Pause,
  Map as MapIcon,
  Edit,
  LucideIcon,
  LucideProps,
} from 'lucide-react-native';
import { useTheme } from '../../design/ThemeProvider';

export type IconName =
  | 'ride'
  | 'plan'
  | 'sos'
  | 'squad'
  | 'profile'
  | 'navigation'
  | 'compass'
  | 'map-pin'
  | 'map-pinned'
  | 'route'
  | 'alert-triangle'
  | 'shield-alert'
  | 'shield-check'
  | 'shield'
  | 'users'
  | 'user'
  | 'user-check'
  | 'layers'
  | 'locate'
  | 'plus'
  | 'minus'
  | 'maximize'
  | 'minimize'
  | 'search'
  | 'wifi'
  | 'wifi-off'
  | 'radio'
  | 'battery'
  | 'battery-charging'
  | 'battery-warning'
  | 'check'
  | 'check-circle'
  | 'x'
  | 'x-circle'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'info'
  | 'calendar'
  | 'flame'
  | 'turn'
  | 'activity'
  | 'sparkles'
  | 'share'
  | 'send'
  | 'message'
  | 'mic'
  | 'volume'
  | 'settings'
  | 'wrench'
  | 'bike'
  | 'history'
  | 'lock'
  | 'refresh'
  | 'clock'
  | 'gauge'
  | 'mountain'
  | 'eye'
  | 'eye-off'
  | 'download'
  | 'file-text'
  | 'alert-octagon'
  | 'arrow-right'
  | 'arrow-up-right'
  | 'storage'
  | 'heart'
  | 'sliders'
  | 'globe'
  | 'edit'
  | 'phone'
  | 'map'
  | 'play'
  | 'pause';

const ICON_MAP: Record<IconName, LucideIcon> = {
  ride: Navigation,
  plan: Route,
  sos: ShieldAlert,
  squad: Users,
  profile: User,
  navigation: Navigation,
  compass: Compass,
  'map-pin': MapPin,
  'map-pinned': MapPinned,
  route: Route,
  'alert-triangle': AlertTriangle,
  'shield-alert': ShieldAlert,
  'shield-check': ShieldCheck,
  shield: Shield,
  users: Users,
  user: User,
  'user-check': UserCheck,
  layers: Layers,
  locate: LocateFixed,
  plus: Plus,
  minus: Minus,
  maximize: Maximize2,
  minimize: Minimize2,
  search: Search,
  wifi: Wifi,
  'wifi-off': WifiOff,
  radio: Radio,
  battery: Battery,
  'battery-charging': BatteryCharging,
  'battery-warning': BatteryWarning,
  check: Check,
  'check-circle': CheckCircle2,
  x: X,
  'x-circle': XCircle,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'chevron-left': ChevronLeft,
  info: Info,
  calendar: Calendar,
  flame: Flame,
  turn: CornerUpRight,
  activity: Activity,
  sparkles: Sparkles,
  share: Share2,
  send: Send,
  message: MessageSquare,
  mic: Mic,
  volume: Volume2,
  settings: Settings,
  wrench: Wrench,
  bike: Bike,
  history: History,
  lock: Lock,
  refresh: RefreshCw,
  clock: Clock,
  gauge: Gauge,
  mountain: Mountain,
  eye: Eye,
  'eye-off': EyeOff,
  download: DownloadCloud,
  'file-text': FileText,
  'alert-octagon': AlertOctagon,
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  storage: HardDrive,
  heart: Heart,
  sliders: Sliders,
  globe: Globe,
  edit: Edit,
  phone: Phone,
  map: MapIcon,
  play: Play,
  pause: Pause,
};

export interface IconProps extends Omit<LucideProps, 'color'> {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color,
  strokeWidth = 2,
  style,
  ...rest
}) => {
  const { colors } = useTheme();
  const IconComponent = ICON_MAP[name] || Info;
  const iconColor = color || colors.text;

  return (
    <IconComponent
      size={size}
      color={iconColor}
      strokeWidth={strokeWidth}
      style={style}
      {...rest}
    />
  );
};
