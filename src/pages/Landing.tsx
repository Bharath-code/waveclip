import React from 'react';
import { Link } from 'react-router-dom';
import { MarketingLayout, PageContainer } from '@/components/layout';
import { Button, Card, Badge } from '@/components/ui';
import { LandingSEO } from '@/components/SEO';
import {
  Sparkles,
  Wand2,
  Mic2,
  FileVideo,
  Zap,
  Globe,
  Lock,
  ArrowRight,
  Check,
  Play,
  Star,
  AudioWaveform,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Landing() {
  return (
    <MarketingLayout>
      <LandingSEO />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950" />

        {/* Decorative Blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-violet-400/20 rounded-full blur-3xl" />

        <PageContainer className="relative pt-20 pb-24 lg:pt-32 lg:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <Badge variant="primary" className="mb-6 animate-fade-in">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Audiogram Generator
            </Badge>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight animate-fade-in">
              Turn Audio Into{' '}
              <span className="text-gradient">Viral Social Videos</span>{' '}
              in Seconds
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto animate-fade-in">
              Create stunning audiograms with AI-generated captions, beautiful waveforms, and one-click export to all social platforms.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="h-5 w-5" />}
                className="w-full sm:w-auto shadow-lg shadow-indigo-500/25"
                onClick={() => window.location.href = '/auth/register'}
              >
                Start Creating Free
              </Button>
              <Button
                variant="ghost"
                size="lg"
                leftIcon={<Play className="h-5 w-5" />}
              >
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2">4.9/5 from 2,000+ creators</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-slate-300 dark:bg-slate-700" />
              <div>No credit card required</div>
            </div>
          </div>

          {/* Hero Image/Preview */}
          <div className="mt-16 relative mx-auto max-w-5xl animate-fade-in">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-slate-200 dark:border-slate-700">
              {/* Mock Editor Preview */}
              <div className="bg-white dark:bg-slate-800 p-6">
                {/* Header Bar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-sm text-slate-500">podcast_clip_01.mp3</div>
                  <Button size="sm" variant="primary">Export</Button>
                </div>

                {/* Waveform Visualization */}
                <div className="relative bg-slate-50 dark:bg-slate-900 rounded-xl p-8">
                  <div className="flex items-end justify-center gap-1 h-24">
                    {[...Array(60)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-gradient-to-t from-indigo-600 to-violet-500 rounded-full transition-all duration-300"
                        style={{
                          height: `${20 + Math.sin(i * 0.3) * 30 + Math.random() * 40}%`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Caption Overlay */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/80 backdrop-blur rounded-lg">
                    <p className="text-white text-sm font-medium">
                      "The future of content creation is here..."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 hidden lg:block animate-float">
              <Card className="p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Caption Generated</div>
                    <div className="text-xs text-slate-500">AI transcription complete</div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="absolute -right-4 top-1/3 hidden lg:block animate-float" style={{ animationDelay: '1s' }}>
              <Card className="p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                    <FileVideo className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Export Ready</div>
                    <div className="text-xs text-slate-500">1080x1080 • MP4</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <PageContainer>
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Everything you need to create{' '}
              <span className="text-gradient">stunning audiograms</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              From upload to export in under a minute. No video editing skills required.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                hoverable
                className="group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110',
                  feature.iconBg
                )}>
                  <feature.icon className={cn('h-6 w-6', feature.iconColor)} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32 bg-slate-50 dark:bg-slate-900/50">
        <PageContainer>
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Loved by <span className="text-gradient">creators worldwide</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        </div>

        <PageContainer className="relative text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to go viral?
          </h2>
          <p className="text-lg text-indigo-100 mb-10 max-w-xl mx-auto">
            Join thousands of creators using Audiogram to grow their audience.
          </p>
          <Button
            size="lg"
            className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg"
            rightIcon={<ArrowRight className="h-5 w-5" />}
            onClick={() => window.location.href = '/auth/register'}
          >
            Get Started Free
          </Button>
          <p className="mt-4 text-sm text-indigo-200">
            Free forever for 5 exports/month • No credit card required
          </p>
        </PageContainer>
      </section>
    </MarketingLayout>
  );
}

// Features data
const features = [
  {
    icon: Wand2,
    title: 'AI-Powered Captions',
    description: 'Automatic transcription with 99% accuracy using OpenAI Whisper. Edit and style captions with ease.',
    iconBg: 'bg-violet-100 dark:bg-violet-900/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    icon: AudioWaveform,
    title: 'Beautiful Waveforms',
    description: 'Choose from multiple waveform styles and colors. Customize every detail to match your brand.',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    icon: FileVideo,
    title: 'One-Click Export',
    description: 'Export to MP4 in any aspect ratio. Optimized for Instagram, TikTok, Twitter, and more.',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process videos in seconds, not minutes. All rendering happens in your browser.',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    icon: Globe,
    title: 'Multi-Platform Ready',
    description: 'Pre-built templates for every social platform. Square, vertical, or horizontal.',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'Your audio never leaves your browser. We don\'t store or access your content.',
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
];

// Testimonials data
const testimonials = [
  {
    quote: "Waveclip cut my podcast clip creation time from 2 hours to 10 minutes. The AI captions are incredibly accurate!",
    name: "Priya Sharma",
    role: "Podcast Host, Tech Talks India",
  },
  {
    quote: "Finally, a tool that actually works. The waveform animations are beautiful and my clips get 3x more engagement now.",
    name: "Rahul Verma",
    role: "Content Creator, 250K+ followers",
  },
  {
    quote: "As a small creator, I couldn't afford expensive video editors. Waveclip gives me professional results for free.",
    name: "Ananya Gupta",
    role: "Independent Musician",
  },
];

// Add floating animation to index.css if not already present
const floatKeyframes = `
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
.animate-float {
  animation: float 3s ease-in-out infinite;
}
`;
