export type InfoPageId = 'help' | 'account-guide' | 'privacy' | 'about' | 'mission';
export type CopyLink = { label: string; target: InfoPageId | 'contact' | 'sign-in' };
export type InfoSection = {
  id: string;
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
  links?: readonly CopyLink[];
};
export type InfoPageCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: readonly InfoSection[];
  showFaqs?: boolean;
};

export const infoNavigation: readonly { id: InfoPageId; label: string }[] = [
  { id: 'help', label: 'Help Centre' },
  { id: 'account-guide', label: 'Account Guide' },
  { id: 'privacy', label: 'Privacy & Safety' },
  { id: 'about', label: 'About Us' },
  { id: 'mission', label: 'Our Mission' },
];

export const infoUiCopy = {
  backHome: 'Back to Home',
  navigationLabel: 'Information pages',
  faqTitle: 'Questions, answered',
  faqIntro: 'A few useful things to know before your next activity.',
  contactTitle: 'Still need a hand?',
  contactDescription: 'Tell us what you were trying to do, what happened and how we can help.',
  contactButton: 'Contact Us',
  signInButton: 'Sign In',
  finishButton: 'Got it',
} as const;

export const supportFaqs: readonly {
  id: string;
  question: string;
  answer: readonly string[];
  link?: CopyLink;
}[] = [
  {
    id: 'start-learning',
    question: 'How do I start an activity?',
    answer: [
      'Choose English Practice or Mathematics, select a comfortable ability level and explore a skill. Open a short lesson, learn from its examples, then practise and review your answers. Sign in to start and keep your learning connected to your account.',
      'You can browse the homepage, subjects and activity cards before signing in. English and Maths activities are available now; planned subjects have their own information pages.',
    ],
    link: { label: 'Read the Account Guide', target: 'account-guide' },
  },
  {
    id: 'choose-stage',
    question: 'Which learning stage should I choose?',
    answer: [
      'Choose a starting point that feels comfortable. The stages help you explore; they do not lock activities to your age. A young learner can take a new challenge, and an adult can begin with the basics.',
      'Try a category, see how it feels and change your starting point when you want to.',
    ],
  },
  {
    id: 'confirm-email',
    question: 'How do I confirm my email?',
    answer: [
      'After creating an account, open the email from Wizpiko and choose Confirm my email. Then return to Wizpiko and sign in.',
      'If the email is missing, check your spam or junk folder and make sure you entered the right address. If a confirmation link does not work, contact us with a short description of the problem. Do not send the link or your password.',
    ],
    link: { label: 'Get account help', target: 'contact' },
  },
  {
    id: 'saved-progress',
    question: 'Where is my learning progress saved?',
    answer: [
      'Signed-in progress is connected to your account. It includes the activities you have completed, scores, XP, unlocked levels and the activity history used for streaks and achievements.',
      'If something looks missing, check that you are using the same account and read any cloud-save message shown on the page. A browser copy may support your active account, but it is not a replacement for successfully saved account progress.',
    ],
  },
  {
    id: 'daily-streak',
    question: 'How does my learning streak work?',
    answer: [
      'A completed learning activity adds an active day to your streak. Signing in alone does not count, and completing several activities on the same day still counts as one active day.',
      'Your streak has a two-missed-day grace period. Return and complete an activity before a third missed day to keep it going. Grace days do not add completed learning days. After three missed days in a row, your next completed activity starts a new streak.',
      'A broken streak does not remove XP or badges you have already earned.',
    ],
  },
  {
    id: 'forgot-password',
    question: 'What if I forget my password?',
    answer: [
      'Open Sign In, choose Forgot password? and enter your account email address. Follow the reset link sent to that address to choose a new password.',
      'Check your spam or junk folder if the message is missing. If the address has no Wizpiko account, the form will explain this and offer Sign Up. For an existing account, follow the password-reset link sent to that email address.',
    ],
    link: { label: 'Open Sign In', target: 'sign-in' },
  },
  {
    id: 'shared-device',
    question: 'Can I use a shared device?',
    answer: [
      'Yes. Sign in to your own account before starting an activity, and sign out when you finish. The next learner should use their own account.',
      'Do not share passwords or leave a sign-in session open for someone else. Read the Privacy & Safety page for more about browser storage and account information.',
    ],
    link: { label: 'Read Privacy & Safety', target: 'privacy' },
  },
  {
    id: 'correction-deletion',
    question: 'How do I correct account details or request account deletion?',
    answer: [
      'You can change your nickname, selected avatar and learning preferences from your profile. For a protected detail such as date of birth, or to request account deletion, contact us.',
      'Include the account email and explain what you need. We may need to confirm ownership before handling a protected account request. Do not include your password, sign-in codes or confirmation links.',
    ],
    link: { label: 'Contact Us', target: 'contact' },
  },
];

export const infoPages: Record<InfoPageId, InfoPageCopy> = {
  help: {
    eyebrow: 'A little help for your next step',
    title: 'How can we help?',
    intro: 'Find quick answers about learning, your account and your progress. If something still feels unclear, send us a message.',
    sections: [
      {
        id: 'find-your-way',
        title: 'Find your way around',
        paragraphs: [
          'The homepage is a place to explore subjects and choose a learning stage. English Practice explores sounds, vocabulary, grammar, reading, listening and writing. Mathematics covers numbers, fractions, algebra, geometry, data and reasoning. Both subjects have lessons and games. Planned subjects have information pages to help you discover what is coming.',
          'Sign in when you are ready to start an activity. For a step-by-step introduction to creating an account, confirming your email and finding your saved learning, open the Account Guide.',
        ],
        links: [{ label: 'Open the Account Guide', target: 'account-guide' }],
      },
    ],
    showFaqs: true,
  },
  'account-guide': {
    eyebrow: 'A learning space of your own',
    title: 'Your account, one step at a time',
    intro: 'Create an account, confirm your email and make a learning space of your own. Your starting point is yours to choose.',
    sections: [
      {
        id: 'create-account',
        title: '1. Create your account',
        paragraphs: [
          'Open Sign In and choose Sign Up. Enter a nickname or display name, your date of birth, an email address and a password. Enter the password again to confirm it, and review the privacy and account information before continuing.',
          'Use an email address you can access. It is needed to confirm your account and recover access if you forget your password.',
        ],
        links: [{ label: 'Read Privacy & Safety', target: 'privacy' }],
      },
      {
        id: 'confirm-account',
        title: '2. Confirm your email',
        paragraphs: [
          'Open the message from Wizpiko and choose Confirm my email. After confirming, return to the website and sign in.',
          'If the message has not arrived, check your spam or junk folder and the email address you entered. If you need help, describe the issue through Contact Us without including your password or confirmation link.',
        ],
      },
      {
        id: 'start-activity',
        title: '3. Choose your first activity',
        paragraphs: [
          'You can browse subjects, stages and activity cards before signing in. A signed-in account is required to start a learning activity.',
          'Choose English Practice or Mathematics and explore Starter, Beginner, Intermediate or Advanced lessons. Select a skill, read the teaching examples, then answer 20 questions in four small sets and review the feedback. There is no timer. Learning stages are starting suggestions, and the basics are open to adults as well as younger learners. The Games section offers English word games and Mental Maths Trail.',
        ],
        links: [{ label: 'Sign In', target: 'sign-in' }],
      },
      {
        id: 'personalise',
        title: '4. Make it yours',
        paragraphs: [
          'Your profile lets you change your nickname, choose an avatar and adjust learning preferences such as sound, animation and learning tips.',
          'Some account details are protected from direct editing. If your date of birth needs correcting, or you have another account question, contact us. Account details and progress are private to your account rather than shown as a public learner profile.',
        ],
      },
      {
        id: 'follow-progress',
        title: '5. Follow your progress',
        paragraphs: [
          'Open My Progress to review your learning. Achievements celebrate completed activities and milestones, while your learning streak shows active learning days.',
          'Completing an activity counts towards your streak; signing in does not. There is a two-missed-day grace period to return. A broken streak does not take away earned XP or badges.',
          'My Certificates shows your progress towards each subject and level. Complete all 20 questions in every skill and earn at least 80% in each skill to qualify. Before issuing a certificate, we ask for your full name and show a preview. You can download a PDF or image, then choose whether to enable a public sharing link.',
          'Read any save or connection message on the page before leaving. If progress looks different on another device, make sure you are signed in to the same account.',
        ],
      },
      {
        id: 'keep-access',
        title: '6. Keep access to your account',
        paragraphs: [
          'On a shared device, sign out when you finish and let the next learner sign in to their own account. Keep your password, confirmation links and sign-in codes private.',
          'If you forget your password, open Sign In and choose Forgot password? Use the reset message sent to your account email to choose a new password.',
          'To request account deletion or a correction to a protected detail, contact us with your account email and a short explanation. We may need to confirm ownership before handling the request.',
        ],
        links: [{ label: 'Contact Us', target: 'contact' }],
      },
    ],
  },
  privacy: {
    eyebrow: 'Understand your learning space',
    title: 'Privacy & Safety',
    intro: 'This overview explains the account, learning and contact information used by Wizpiko, and the choices you can make while using the website.',
    sections: [
      {
        id: 'account-information',
        title: 'Account and profile information',
        paragraphs: [
          'Creating an account asks for an email address, a nickname or display name, a date of birth and a password. Supabase Authentication handles sign-in, email confirmation and password recovery.',
          'Your learner profile includes your nickname, date of birth, selected avatar and learning preferences. The date of birth supports age-appropriate profile labels. Your preferred ability level and skills help guide lesson recommendations. Learning stages do not restrict which activities you may choose.',
          'Your profile and learning progress are protected by account access rules. They are not public learner profiles, and other learners cannot view them through the normal website.',
        ],
      },
      {
        id: 'learning-information',
        title: 'Learning progress and activity',
        paragraphs: [
          'Signed-in activity records support the progress shown in your account. Depending on the activity, these records include completed words or questions, scores, XP, unlocked levels and activity dates.',
          'The website uses those records to show progress, streaks and earned achievements. Completing an activity contributes to your streak; simply signing in does not. Earned XP and badges remain when a streak breaks.',
        ],
      },
      {
        id: 'certificates',
        title: 'Certificates and optional sharing',
        paragraphs: [
          'We ask for your full name before issuing an earned certificate. That name, the subject, level, issue date and achievement requirements are saved with the certificate in your account. Certificates start private.',
          'If you enable public sharing, anyone with the link can view and download that certificate. Its full name, subject, level and issue date become visible. Your email address, date of birth, answers and other account details are not included. You can disable the public link from My Certificates. Copies someone has already downloaded or shared may remain with them.',
        ],
      },
      {
        id: 'browser-storage',
        title: 'Information stored in this browser',
        paragraphs: [
          'The website may keep a sign-in session and an account-specific copy of progress or preferences in your browser to support the active account. Browser storage can be affected by private browsing, device settings or clearing site data.',
          'A local copy is not a substitute for a successful cloud save. Check the account and save messages if you are unsure whether an activity has been saved.',
          'Sign out when you finish on a shared device. The next person should sign in to their own account rather than continue in yours.',
        ],
      },
      {
        id: 'contact-information',
        title: 'Messages you send us',
        paragraphs: [
          'The Contact Us form asks for your name, email address and suggestion or question. These details are sent to the Wizpiko support team so the request can be reviewed and, where appropriate, answered.',
          'Only include information needed to explain your request. Do not send passwords, sign-in codes, confirmation links or another person’s private account information. People handling support requests may read the message you submit.',
        ],
        links: [{ label: 'Open Contact Us', target: 'contact' }],
      },
      {
        id: 'services',
        title: 'Services involved in running Wizpiko',
        paragraphs: [
          'Supabase provides authentication and cloud storage for account profiles and learning progress. A server-side email service processes contact-message delivery to the support inbox. Your browser also connects to the website host to load pages and assets.',
          'Sign-in and password recovery check whether an entered email has an account so the form can offer the appropriate next step. Repeated account checks and contact submissions are limited using protected request metadata. These services can also process technical information needed to operate their systems. This overview does not describe every provider’s own logs or internal processes. Contact us if you have a question about how a particular feature handles your information.',
        ],
      },
      {
        id: 'choices-requests',
        title: 'Your choices and account requests',
        paragraphs: [
          'You can edit your nickname, selected avatar and available learning preferences from your account. You can sign out at any time.',
          'For a correction to a protected detail, or to request account deletion, use Contact Us and include the account email and a clear description of the request. We may need to confirm ownership before handling a protected account request.',
          'Younger learners may need help from a trusted adult when choosing account details and understanding what to share online.',
        ],
        links: [{ label: 'Ask an account or privacy question', target: 'contact' }],
      },
      {
        id: 'practical-safety',
        title: 'A few practical safety habits',
        paragraphs: ['A little care helps keep a shared learning space comfortable.'],
        bullets: [
          'Choose a nickname that does not reveal more personal information than you want to share.',
          'Use your own account and keep your password private.',
          'Check that you are on wizpiko.com before entering account details.',
          'Sign out before someone else uses a shared device.',
          'Tell us about an account or website problem without including private sign-in information.',
        ],
      },
    ],
  },
  about: {
    eyebrow: 'Think. Play. Shine.',
    title: 'A place for curious minds',
    intro: 'Wizpiko turns practice into small, enjoyable discoveries for learners from KG through adulthood.',
    sections: [
      {
        id: 'everyone-starts',
        title: 'Everyone has a starting point',
        paragraphs: [
          'Some learners are making their first discoveries. Others are building school skills, returning to a subject or learning something new as adults. Wizpiko makes room for each of those beginnings.',
          'Our learning stages help you find your way without deciding what you are allowed to try. Start with the basics, revisit a familiar idea or choose a fresh challenge at your own pace.',
        ],
      },
      {
        id: 'learn-through-play',
        title: 'Learning you can play',
        paragraphs: [
          'English Practice brings together 24 short lessons across four ability levels, with teaching examples, varied practice and useful explanations. Explore sounds, vocabulary, grammar, reading, listening and writing. Crosswords and multiple-choice challenges, including ten newly written Wizpiko word puzzles, are part of the experience.',
          'English and Mathematics each offer four ability levels, with six skills and 20 questions per skill. Lessons have no timer, and both subjects also have a Games branch. Science and other planned subjects have information pages while they are being prepared.',
        ],
      },
      {
        id: 'personal-space',
        title: 'A learning space of your own',
        paragraphs: [
          'A signed-in account connects your activities to your progress. Your profile, selected avatar and preferences help make the learning space feel familiar.',
          'XP, unlocked levels, achievements and a learning streak give you ways to notice your effort. They are there to encourage another useful step, wherever you are starting.',
        ],
        links: [{ label: 'See how accounts work', target: 'account-guide' }],
      },
      {
        id: 'keep-growing',
        title: 'Growing with curiosity',
        paragraphs: [
          'Wizpiko is still growing. We want new activities and subjects to feel approachable, useful and enjoyable for different learners.',
          'Your questions and suggestions help us understand what could work better. If you have an idea, or something gets in the way of learning, tell us.',
        ],
        links: [{ label: 'Share a suggestion', target: 'contact' }, { label: 'Read Our Mission', target: 'mission' }],
      },
    ],
  },
  mission: {
    eyebrow: 'Small steps. Lasting curiosity.',
    title: 'Make room for a lifetime of learning',
    intro: 'Our mission is to make practice feel approachable, meaningful and enjoyable at every age.',
    sections: [
      {
        id: 'curiosity',
        title: 'Curiosity before comparison',
        paragraphs: [
          'A starting point should open a door. It should not make someone feel too young, too old or too far behind to begin.',
          'We want learners to explore at a level that feels right, with space to revisit the basics and confidence to try the next challenge.',
        ],
      },
      {
        id: 'confidence',
        title: 'Confidence through practice',
        paragraphs: [
          'Learning grows through trying, noticing and trying again. Playful activities and clear feedback can make that process easier to return to.',
          'We aim to make small achievements visible, so progress feels connected to real effort rather than comparison with someone else.',
        ],
      },
      {
        id: 'encouragement',
        title: 'Encouragement that leaves room for life',
        paragraphs: [
          'A streak can be a helpful nudge, but life does not always follow a perfect schedule. Wizpiko includes a two-missed-day grace period so a short break does not immediately end a streak.',
          'Returning matters. Earned XP and badges stay with your account even when it is time to start a new streak.',
        ],
      },
      {
        id: 'possibilities',
        title: 'More ways to discover',
        paragraphs: [
          'English Practice and Mathematics offer different ways to explore. More subjects are planned, with the same goal: useful practice that feels welcoming across different stages of life.',
          'We want to build on what helps learners, improve what feels confusing and keep curiosity at the centre of the experience.',
        ],
        links: [{ label: 'Help shape what comes next', target: 'contact' }, { label: 'Learn about Wizpiko', target: 'about' }],
      },
    ],
  },
};

export const contactCopy = {
  eyebrow: 'Let’s make learning better',
  title: 'Contact Us',
  intro: 'Have a question, idea or something we should improve? Send us a message. You do not need a Wizpiko account to contact us.',
  formTitle: 'What would you like to share?',
  nameLabel: 'Name',
  namePlaceholder: 'Your name',
  nameHint: 'The name you would like us to use.',
  emailLabel: 'Email',
  emailPlaceholder: 'you@example.com',
  emailHint: 'Use an address where we can reply.',
  suggestionLabel: 'Suggestion',
  suggestionPlaceholder: 'Tell us what is on your mind…',
  suggestionHint: 'For a website issue, include what you were trying to do and what happened.',
  privacyNote: 'Your name, email address and message are sent to the Wizpiko support team so your request can be reviewed. Please leave out passwords, sign-in codes and private information that is not needed.',
  privacyButton: 'Read Privacy & Safety',
  submitButton: 'Send message',
  submitting: 'Sending your message…',
  validationSummary: 'Please check the highlighted fields.',
  nameError: 'Enter your name using 1 to 100 characters.',
  emailError: 'Enter a valid email address using no more than 254 characters.',
  suggestionError: 'Write a message between 10 and 5,000 characters.',
  failure: 'Your message could not be sent. Please try again in a moment.',
  successTitle: 'Your message has been sent',
  successDescription: 'Thank you for getting in touch. Your message has been accepted for delivery to the Wizpiko support inbox.',
  anotherMessage: 'Send another message',
  backHome: 'Back to Home',
  supportTitle: 'Contact the Wizpiko team',
  supportDescription: 'Use the form to share a question or suggestion. We will use the email address you provide to reply.',
  expectationsTitle: 'A little detail helps',
  expectationsDescription: 'Describe the question or idea clearly. If something went wrong, tell us which page or activity you were using and what you expected to happen.',
  accountHint: 'For an account correction or deletion request, include the account email. We may need to confirm ownership before handling the request.',
  honeypotLabel: 'Leave this field empty',
} as const;

export const accountMessageDrafts = {
  signInRequiredTitle: 'Sign in to start learning',
  signInRequiredDescription: 'Browse subjects and activities, then sign in to play and save your progress to your account.',
  noAccount: 'No account found with this email. Please sign up.',
  incorrectPassword: 'The password is incorrect. Please try again.',
  signUpDescription: 'Choose a learning name, add your details and create an account of your own.',
  privacyAcknowledgement: 'I have reviewed Wizpiko’s Privacy & Safety information and Account Guide.',
  confirmationSent: 'Check your email for a confirmation link. After confirming, sign in with your password.',
  confirmationPending: 'Please confirm your email before signing in. Check your inbox and spam or junk folder for the message from Wizpiko.',
  confirmationComplete: 'Email confirmed. Sign in with your password.',
  confirmationLinkError: 'This confirmation link could not be used. It may have expired or already been opened. Contact us if you need help, without sharing the link.',
  registrationUnavailable: 'New accounts are temporarily unavailable. Please try again later. You can still browse the website.',
  signedOut: 'You are signed out. Sign in again when you are ready to continue learning.',
  passwordResetRequested: 'Check your email for a password-reset link.',
  passwordUpdated: 'Your password has been updated. You can now sign in.',
  progressSaving: 'Saving your learning progress…',
  progressSaved: 'Your learning progress is saved to your account.',
  progressSaveError: 'Your progress could not be saved to your account yet. Keep this page open and check your connection before signing out.',
  accountPrivacyNote: 'Activities are connected to your signed-in account. Sign out when you finish on a shared device.',
} as const;

export const confirmationEmailCopy = {
  sender: 'Wizpiko <no-reply@wizpiko.com>',
  subject: 'Confirm your Wizpiko account',
  preview: 'Confirm your email to start your Wizpiko learning adventure.',
  title: 'Welcome to Wizpiko',
  greeting: 'Hello, curious mind!',
  introduction: 'You’re one step away from your Wizpiko account. Confirm your email address to start practising, save your progress and enjoy learning at your own pace.',
  button: 'Confirm my email',
  confirmationUrl: '{{ .ConfirmationURL }}',
  afterConfirmation: 'After confirming, return to Wizpiko and sign in to begin.',
  fallbackIntroduction: 'If the button does not open, copy this link into your browser:',
  unexpectedEmail: 'If you did not create a Wizpiko account, you can ignore this email.',
  support: 'Need a hand? Contact support@wizpiko.com.',
  visitSite: 'Visit Wizpiko',
  brand: 'Wizpiko · Think. Play. Shine.',
  logoAlt: 'Wizpiko — Think. Play. Shine.',
} as const;
