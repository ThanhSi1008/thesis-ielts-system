import { User as UserIcon } from "lucide-react";

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export default function ProfileHeader({ firstName, lastName, email, createdAt }: ProfileHeaderProps) {
  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : email.slice(0, 2).toUpperCase();

  const displayName = firstName && lastName
    ? `${firstName} ${lastName}`
    : email;

  const memberSince = new Date(createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col items-center text-center py-10 px-6 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:via-slate-900 dark:to-primary/10 rounded-2xl border border-gray-100 dark:border-slate-800">
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white dark:ring-slate-800 mb-5">
        {initials}
      </div>

      {/* Name */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
        {displayName}
      </h1>

      {/* Email */}
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">
        {email}
      </p>

      {/* Member since */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 font-medium">
        <UserIcon className="w-3.5 h-3.5" />
        Member since {memberSince}
      </div>
    </div>
  );
}
