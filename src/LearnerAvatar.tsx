import type { CSSProperties } from 'react';
import type { LearnerProfile } from './learnerData';
import './portal-refresh.css';

export const learnerAvatars: LearnerProfile['avatar'][] = ['girl', 'boy', 'robot', 'panda', 'cat'];
const positions = { girl: [0, 0], boy: [1, 0], robot: [2, 0], panda: [0, 1], cat: [1, 1] } as const;

type Props = { avatar?: LearnerProfile['avatar']; className?: string; decorative?: boolean };
/** One saved avatar supplies the homepage, account navigation and profile artwork. */
export function LearnerAvatar({ avatar = 'robot', className = '', decorative = false }: Props) {
  const chosen = positions[avatar] ? avatar : 'robot';
  const [x, y] = positions[chosen];
  return <span className={`wp-avatar ${className}`} data-avatar={chosen}
    style={{ '--avatar-x': x, '--avatar-y': y } as CSSProperties}
    role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : `${chosen} avatar`} aria-hidden={decorative || undefined}>
    <span className="wp-avatar-frame"><img src={`${import.meta.env.BASE_URL}wizpiko-avatars.webp`} alt="" width="1200" height="800" decoding="async" draggable="false" /></span>
  </span>;
}
