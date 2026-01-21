import { Building2, UserPlus, GraduationCap } from 'lucide-react';

const steps = [
  {
    number: '1',
    icon: Building2,
    title: 'Create Your Organisation',
    description:
      'Sign up and create your educational institution in minutes. Set your organisation name, configure settings, and get started.',
  },
  {
    number: '2',
    icon: UserPlus,
    title: 'Add Your Team',
    description:
      'Invite professors and students to join. Set up departments, assign roles, and manage permissions with granular controls.',
  },
  {
    number: '3',
    icon: GraduationCap,
    title: 'Start Teaching',
    description:
      'Create courses, schedule lessons, track grades and attendance. Everything you need for effective education.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get your educational institution up and running in three simple steps
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[calc(50%+4rem)] w-[calc(100%-8rem)] h-0.5 bg-border" />
              )}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <step.icon className="h-10 w-10" />
                  </div>
                  <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
