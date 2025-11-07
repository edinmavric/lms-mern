import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Users,
  Workflow,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Link,
  Badge,
} from '../components/ui';

const benefits = [
  {
    title: 'Centralize learning experiences',
    description:
      'Manage courses, lessons, assessments, and attendance in one tenant-aware workspace built for multi-campus organizations.',
    icon: Workflow,
  },
  {
    title: 'Empower every role',
    description:
      'Granular permissions for admins, professors, and students keep your institution compliant while unlocking collaboration.',
    icon: Users,
  },
  {
    title: 'Enterprise-grade security',
    description:
      'Audit logging, password hardening, rate limiting, and Mailjet-powered notifications ship out of the box.',
    icon: ShieldCheck,
  },
];

const highlights = [
  'Tenant isolation across all data models',
  'Role-based access controls and approval flows',
  'Automated grading, attendance, and enrollment tracking',
  'Real-time email workflows for approvals and resets',
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-muted/30 via-background to-background">
      <section className="container mx-auto flex flex-col gap-10 px-4 py-16 text-center md:flex-row md:items-center md:gap-16 md:text-left">
        <div className="flex-1 space-y-6">
          <Badge
            variant="secondary"
            className="inline-flex items-center gap-2 text-sm"
          >
            <CheckCircle2 className="h-4 w-4 text-success" />
            Production-ready security built in
          </Badge>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            Modern Learning Management for Multi-tenant Organizations
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            Launch a full-stack LMS with rigorous security, audit trails, and
            theming baked in. Onboard new schools or departments in minutes, not
            months.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => navigate('/signup/tenant')}
            >
              Start as organisation
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/signup')}
            >
              Join an existing tenant
            </Button>
          </div>
          <div className="flex flex-col items-start gap-2 rounded-lg bg-card/60 p-6 text-left shadow-sm backdrop-blur lg:flex-row lg:items-center lg:gap-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" />
              SOC2-aligned controls
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Users className="h-5 w-5 text-primary" />
              Unlimited tenants, users, and courses
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Workflow className="h-5 w-5 text-primary" />
              Ready-to-run approval workflows
            </div>
          </div>
        </div>

        <div className="flex-1">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle className="text-left text-2xl">
                Why teams adopt our LMS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {benefits.map(benefit => (
                <div key={benefit.title} className="flex gap-4 text-left">
                  <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container mx-auto grid gap-6 px-4 py-16 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Unified operations for modern academic organisations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              Manage the full learner lifecycle with granular permissions and
              tenant-aware data segregation. Approve new members, launch
              courses, track performance, and automate communications.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {highlights.map(item => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/app" variant="primary">
              View admin dashboard preview
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Secure by design</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Authentication flows ship with strong password enforcement, hashed
              reset tokens, refresh tokens, rate limiting, and Mailjet-powered
              notifications.
            </p>
            <p>
              Every request is tenant-scoped, logged, and validated. Configure
              CORS, request size limits, and graceful shutdown behaviour to
              match your infrastructure.
            </p>
            <p>
              The frontend consumes a fully documented OpenAPI spec and includes
              an automated E2E test suite for every endpoint.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="border-t border-border bg-card/40">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-16 text-center">
          <h2 className="text-3xl font-semibold">Launch your tenant today</h2>
          <p className="max-w-2xl text-muted-foreground">
            Ready-to-run deployment checklists, Swagger documentation, and a
            themed React client mean your team can focus on learning, not
            boilerplate.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              className="gap-2"
              onClick={() => navigate('/signup/tenant')}
            >
              Create tenant
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Return to login
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
