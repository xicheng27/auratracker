type IconProps = {
  className?: string;
};

function Icon({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 10.75 12 3.5l9 7.25" />
      <path d="M5.5 9.5v11h13v-11" />
    </Icon>
  );
}

export function PostIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M12 9v6M9 12h6" />
    </Icon>
  );
}

export function GroupsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="9" r="3.25" />
      <path d="M3.5 19.5c.6-3.2 2.7-5 5.5-5s4.9 1.8 5.5 5" />
      <path d="M15.5 6.5a3 3 0 1 1 1.5 5.6" />
      <path d="M16.5 14.6c2.1.4 3.5 1.9 4 4.4" />
    </Icon>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5H5a3 3 0 0 0 3.2 4M16 5h3a3 3 0 0 1-3.2 4" />
      <path d="M12 13v4M8.5 20h7" />
    </Icon>
  );
}

export function ProfileIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.5 3.5-5.5 7-5.5s6.2 2 7 5.5" />
    </Icon>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13.5 6 9.5Z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </Icon>
  );
}

export function CommentIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M21 12a8 8 0 0 1-8 8H4l1.8-3A8 8 0 1 1 21 12Z" />
    </Icon>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 14V4" />
      <path d="m8.5 7 3.5-3.5L15.5 7" />
      <path d="M6 11v8.5h12V11" />
    </Icon>
  );
}

export function CameraIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 8.5h2.5L8 6h8l1.5 2.5H20v11H4Z" />
      <circle cx="12" cy="13.5" r="3.2" />
    </Icon>
  );
}

export function VideoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="6.5" width="12" height="11" rx="2.5" />
      <path d="m15.5 10.5 5-2.5v8l-5-2.5" />
    </Icon>
  );
}

export function GalleryIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="9" cy="9" r="1.6" />
      <path d="m5 17 4.5-4.5 4 4L16 13l3 3.5" />
    </Icon>
  );
}

export function TextIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 6h14M5 6v-.5M19 6v-.5M12 6v13M9.5 19h5" />
    </Icon>
  );
}
