import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MarketingLayout, PageContainer } from '@/components/layout';
import { Button, Card, Badge } from '@/components/ui';
import { Magnetic } from '@/components/ui/Magnetic';
import { LandingSEO } from '@/components/SEO';
import {
  Sparkles,
  Wand2,
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
} as const;

export default function Landing() {
  return (
    <MarketingLayout>
      <LandingSEO />
      {/* Hero Section */}
      <section className="relative overflow-hidden noise-overlay">
        {/* Animated Mesh Background */}
        <div className="absolute inset-0 mesh-gradient opacity-30 dark:opacity-40" />

        {/* Background Blobs with Motion */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, -40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-1/4 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl"
        />

        <PageContainer className="relative pt-20 pb-24 lg:pt-32 lg:pb-32">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <Badge variant="primary" className="mb-6 px-4 py-1.5 shadow-glow-indigo border-indigo-400/30">
                <Sparkles className="h-4 w-4 mr-2 text-indigo-400" />
                AI-Powered Audiogram Generator
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.1] mb-6 tracking-tight"
            >
              Turn Audio Into{' '}
              <span className="text-gradient">Viral Social Videos</span>{' '}
              in Seconds
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
            >
              Create stunning audiograms with AI-generated captions, beautiful waveforms, and one-click export to all social platforms.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Magnetic strength={0.4}>
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  className="w-full sm:w-auto px-10 h-14 text-lg rounded-2xl shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30"
                  onClick={() => window.location.href = '/auth/register'}
                >
                  Start Creating Free
                </Button>
              </Magnetic>
              <Magnetic strength={0.3}>
                <Button
                  variant="ghost"
                  size="lg"
                  leftIcon={<Play className="h-5 w-5" />}
                  className="h-14 rounded-2xl text-lg hover:bg-slate-100/10"
                >
                  Watch Demo
                </Button>
              </Magnetic>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              variants={itemVariants}
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400"
            >
              <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1 font-medium">4.9/5 from 2,000+ creators</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-slate-300 dark:bg-slate-700" />
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                No credit card required
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image/Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
            className="mt-20 relative mx-auto max-w-6xl group"
          >
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-500/20 border border-white/20 glass p-2 backdrop-blur-3xl">
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-[1.5rem] p-8">
                {/* Header Bar */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm" />
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-sm" />
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm" />
                  </div>
                  <div className="text-sm font-medium text-slate-500 tracking-wide uppercase">AI Editor Studio</div>
                  <Badge variant="primary" size="sm">v1.2.0-PRO</Badge>
                </div>

                {/* Waveform Visualization */}
                <div className="relative bg-slate-950 rounded-2xl p-12 overflow-hidden group">
                  <div className="absolute inset-0 mesh-gradient opacity-10" />
                  <div className="flex items-end justify-center gap-1.5 h-32 relative z-10">
                    {[...Array(40)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: "20%" }}
                        animate={{ height: [`${20 + Math.random() * 60}%`, `${30 + Math.random() * 50}%`, `${20 + Math.random() * 60}%`] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.05 }}
                        className="w-2.5 bg-gradient-to-t from-indigo-500 via-violet-400 to-fuchsia-400 rounded-full"
                      />
                    ))}
                  </div>

                  {/* Caption Overlay */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl"
                  >
                    <p className="text-white text-lg font-bold tracking-tight">
                      "Unlock the true power of your audio content..."
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-8 top-1/2 hidden lg:block"
            >
              <Card variant="glass" className="p-5 backdrop-blur-xl border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center shadow-inner">
                    <Check className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">AI Transcribed</div>
                    <div className="text-xs text-slate-500">99.2% Accuracy</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -right-8 top-1/3 hidden lg:block"
            >
              <Card variant="glass" className="p-5 backdrop-blur-xl border-white/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center shadow-inner">
                    <FileVideo className="h-6 w-6 text-violet-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">4K Ready</div>
                    <div className="text-xs text-slate-500">Auto-Scaling MP4</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </PageContainer>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 lg:py-40 relative">
        <PageContainer>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <Badge variant="outline" className="mb-4 px-4 py-1 uppercase tracking-widest text-[10px] font-bold border-indigo-500/30 text-indigo-400">Features</Badge>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
              Everything you need to create{' '}
              <span className="text-gradient">stunning audiograms</span>
            </h2>
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              From upload to export in under a minute. No video editing skills required.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  variant="default"
                  hoverable
                  className="group h-full p-8 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-colors"
                >
                  <div className={cn(
                    'w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-8 shadow-inner transition-all duration-300 group-hover:scale-110 group-hover:rotate-3',
                    feature.iconBg
                  )}>
                    <feature.icon className={cn('h-7 w-7', feature.iconColor)} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 lg:py-40 bg-slate-50 dark:bg-slate-950/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.05),transparent)]" />
        <PageContainer className="relative">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-4 px-4 py-1 uppercase tracking-widest text-[10px] font-bold border-fuchsia-500/30 text-fuchsia-400">Social Proof</Badge>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
              Loved by <span className="text-gradient">creators worldwide</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Card variant="glass" className="p-8 h-full flex flex-col justify-between border-white/10">
                  <div>
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xl text-slate-700 dark:text-slate-200 mb-8 font-medium leading-relaxed italic">
                      "{testimonial.quote}"
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xl font-bold shadow-xl">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{testimonial.name}</p>
                      <p className="text-slate-500 font-medium">{testimonial.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-40 px-4">
        <PageContainer>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[3rem] bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-900 relative overflow-hidden p-12 lg:p-24 text-center group"
          >
            {/* Decorative Elements */}
            <div className="absolute inset-0 opacity-20 mesh-gradient" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-400/10 rounded-full blur-[100px]"
            />

            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-8 tracking-tight">
                Ready to go viral?
              </h2>
              <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                Join thousands of creators using Audiogram to grow their audience across TikTok, Reels, and YouTube.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Magnetic strength={0.3}>
                  <Button
                    size="lg"
                    className="bg-white text-indigo-700 hover:bg-indigo-50 px-12 h-16 text-xl rounded-[1.5rem] shadow-2xl shadow-black/20"
                    rightIcon={<ArrowRight className="h-6 w-6" />}
                    onClick={() => window.location.href = '/auth/register'}
                  >
                    Get Started Free
                  </Button>
                </Magnetic>
              </div>
              <p className="mt-8 text-indigo-200/80 font-medium tracking-wide">
                Free forever for 5 exports/month • No credit card required
              </p>
            </div>
          </motion.div>
        </PageContainer>
      </section>
    </MarketingLayout>
  );
}

// Features data
const features = [
  {
    icon: Wand2,
    title: 'AI Captions',
    description: 'Automatic transcription with 99% accuracy using OpenAI Whisper. Edit and style captions with ease.',
    iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    icon: AudioWaveform,
    title: 'Live Waveforms',
    description: 'Choose from multiple waveform styles and colors. Customize every detail to match your brand identity.',
    iconBg: 'bg-violet-500/10 dark:bg-violet-500/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    icon: FileVideo,
    title: '1-Click Export',
    description: 'Export to MP4 in any aspect ratio. Optimized for Instagram, TikTok, Twitter, and more platforms.',
    iconBg: 'bg-fuchsia-500/10 dark:bg-fuchsia-500/20',
    iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
  },
  {
    icon: Zap,
    title: 'Fast Rendering',
    description: 'Process videos in seconds, not minutes. All rendering happens instantly right in your browser.',
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: Globe,
    title: 'Multi-Format',
    description: 'Pre-built templates for every social platform. Square, vertical (9:16), or horizontal (16:9) layouts.',
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'Your audio never leaves your browser. We don\'t store or access your content without permission.',
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/20',
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
    quote: "Finally, a tool that actually works. The waveform animations are beautiful and my clips get 3x more engagement.",
    name: "Rahul Verma",
    role: "Content Creator, 250K+ followers",
  },
  {
    quote: "As a small creator, I couldn't afford expensive video editors. Waveclip gives me professional results for free.",
    name: "Ananya Gupta",
    role: "Independent Musician",
  },
];
