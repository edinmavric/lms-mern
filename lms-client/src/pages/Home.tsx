import { useAuthStore } from '../store/authStore';
import { BookOpen, GraduationCap, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Link } from '../components/ui/Link';

export function Home() {
  const { user } = useAuthStore();

  const dashboardCards = [
    {
      title: 'Courses',
      description: 'Manage your courses',
      icon: BookOpen,
      href: '/courses',
    },
    {
      title: 'Grades',
      description: 'View your grades',
      icon: GraduationCap,
      href: '/grades',
    },
    {
      title: 'Attendance',
      description: 'Track attendance',
      icon: Calendar,
      href: '/attendance',
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-4">
          Welcome back, {user?.firstName} {user?.lastName}!
        </h1>
        <p className="text-muted-foreground">
          Role:{' '}
          <span className="font-semibold capitalize text-foreground">
            {user?.role}
          </span>
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map(card => (
          <DashboardCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
}

function DashboardCard({
  title,
  description,
  icon: Icon,
  href,
}: DashboardCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        'group relative block',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg'
      )}
    >
      <Card className="p-6 hover:border-primary/50 hover:shadow-lg transition-all h-full">
        <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3 text-primary">
          <Icon className="h-6 w-6" />
        </div>

        <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
          {title}
        </h2>
        <p className="text-muted-foreground">{description}</p>

        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg
            className="h-5 w-5 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </Card>
    </Link>
  );
}
