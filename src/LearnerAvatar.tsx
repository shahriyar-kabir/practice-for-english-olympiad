import type { CSSProperties } from 'react';
import { avatarIds } from './learnerData';
import type { LearnerProfile } from './learnerData';
import './portal-refresh.css';

export const learnerAvatars: LearnerProfile['avatar'][] = [...avatarIds];
export const avatarLabels:Record<LearnerProfile['avatar'],string>={girl:'Girl',boy:'Boy',robot:'Robot',panda:'Panda',cat:'Cat','teen-girl':'Teenage girl','teen-boy':'Teenage boy','young-woman':'Young woman','young-man':'Young man',woman:'Adult woman',man:'Adult man','middle-woman':'Middle-aged woman','middle-man':'Middle-aged man'};
const positions = { girl: [0, 0], boy: [1, 0], robot: [2, 0], panda: [0, 1], cat: [1, 1], 'teen-girl':[0,0], 'teen-boy':[1,0], 'young-woman':[2,0], 'young-man':[3,0], woman:[0,1], man:[1,1], 'middle-woman':[2,1], 'middle-man':[3,1] } as const;

type Props = { avatar?: LearnerProfile['avatar']; className?: string; decorative?: boolean };
/** One saved avatar supplies the homepage, account navigation and profile artwork. */
export function LearnerAvatar({ avatar = 'robot', className = '', decorative = false }: Props) {
  const chosen = positions[avatar] ? avatar : 'robot';
  const [x, y] = positions[chosen];
  const ageAvatar=!['girl','boy','robot','panda','cat'].includes(chosen);
  return <span className={`wp-avatar ${ageAvatar?'wp-avatar-age ':''}${chosen === 'robot' ? 'wp-avatar-single ' : ''}${className}`} data-avatar={chosen}
    style={{ '--avatar-x': x, '--avatar-y': y } as CSSProperties}
    role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : `${avatarLabels[chosen]} avatar`} aria-hidden={decorative || undefined}>
    <span className="wp-avatar-frame"><img src={`${import.meta.env.BASE_URL}${chosen === 'robot' ? 'wizpiko-reading-companion.webp' : ageAvatar ? 'wizpiko-age-avatars.webp' : 'wizpiko-avatar-portraits.webp'}`} alt="" width={chosen === 'robot' ? 1024 : 1200} height={chosen === 'robot' ? 1024 : 800} loading="lazy" decoding="async" draggable="false" /></span>
  </span>;
}
