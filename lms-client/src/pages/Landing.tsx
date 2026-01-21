import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Video,
  Building2,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from 'lucide-react';

import { Button, Badge } from '../components/ui';
import {
  LandingHeader,
  LandingFooter,
  FeatureCard,
  HowItWorks,
} from '../components/landing';

const features = [
  {
    icon: BookOpen,
    title: 'Course Management',
    description:
      'Create courses, organize lessons, and upload materials. Everything you need for structured learning.',
  },
  {
    icon: GraduationCap,
    title: 'Smart Grading',
    description:
      'Custom grading scales, automatic calculations, and comprehensive grade history with analytics.',
  },
  {
    icon: ClipboardCheck,
    title: 'Attendance Tracking',
    description:
      'Track attendance automatically, generate reports, and set policies per course or organisation.',
  },
  {
    icon: Video,
    title: 'Video Conferencing',
    description:
      'Built-in video calls for lessons and consultations. Connect with students from anywhere.',
  },
  {
    icon: Building2,
    title: 'Multi-Tenant',
    description:
      'Complete data isolation per organisation. Each institution operates independently and securely.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description:
      'Dashboards, charts, and exportable reports. Make data-driven decisions for better outcomes.',
  },
];

const securityFeatures = [
  'Complete data isolation per organisation',
  'Role-based access control (Admin, Professor, Student)',
  'Strong password enforcement with bcrypt hashing',
  'Rate limiting and request validation',
  'Audit logging for all activities',
  'Secure token-based authentication',
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="container mx-auto px-4 py-20 md:py-28">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <Badge
                variant="secondary"
                className="mb-6 inline-flex items-center gap-2"
              >
                <Zap className="h-3.5 w-3.5" />
                Enterprise-ready LMS Platform
              </Badge>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6">
                The Complete Platform for{' '}
                <span className="text-primary">Modern Education</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
                Create your educational organisation in minutes. Manage courses,
                track grades, monitor attendance, and connect through video
                calls. All with enterprise-grade security.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  size="lg"
                  className="gap-2 text-base"
                  onClick={() => navigate('/signup/tenant')}
                >
                  Create Your Organisation
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base"
                  onClick={() => navigate('/signup')}
                >
                  Join Existing Organisation
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Free to get started</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Unlimited users</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative gradient orbs */}
          <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/20 rounded-full blur-[128px] -z-10" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[128px] -z-10" />
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Everything You Need to Run Your Institution
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                A comprehensive suite of tools designed specifically for
                educational institutions of all sizes
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map(feature => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <HowItWorks />

        {/* Security Section */}
        <section id="security" className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-primary mb-4">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-wider">
                    Enterprise Security
                  </span>
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  Built with Security at Its Core
                </h2>
                <p className="text-muted-foreground mb-8">
                  Your data security is our top priority. LMS++ implements
                  industry-standard security practices to keep your institution's
                  data safe and compliant.
                </p>
                <ul className="space-y-3">
                  {securityFeatures.map(feature => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 border">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-background rounded-lg border">
                      <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Data Isolation</p>
                        <p className="text-sm text-muted-foreground">
                          Each organisation's data is completely separate
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-background rounded-lg border">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">Role-Based Access</p>
                        <p className="text-sm text-muted-foreground">
                          Granular permissions for every user
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-background rounded-lg border">
                      <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium">Audit Logging</p>
                        <p className="text-sm text-muted-foreground">
                          Track all activities with detailed logs
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Transform Your Institution?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join educational institutions already using LMS++ to streamline
                their operations and improve learning outcomes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={() => navigate('/signup/tenant')}
                >
                  Get Started for Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
