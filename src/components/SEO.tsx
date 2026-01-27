import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    twitterHandle?: string;
    noIndex?: boolean;
}

const DEFAULT_TITLE = 'Waveclip — AI-Powered Audiogram Generator';
const DEFAULT_DESCRIPTION = 'Transform your podcasts and audio into stunning videos with AI-generated captions. Create professional audiograms in seconds with Waveclip.';
const DEFAULT_KEYWORDS = [
    'audiogram',
    'podcast video',
    'audio to video',
    'AI captions',
    'transcription',
    'waveform generator',
    'social media video',
    'podcast marketing',
    'audio visualization',
];
const DEFAULT_IMAGE = '/og-image.png';
const SITE_URL = 'https://waveclip.app';

export function SEO({
    title,
    description = DEFAULT_DESCRIPTION,
    keywords = DEFAULT_KEYWORDS,
    image = DEFAULT_IMAGE,
    url = SITE_URL,
    type = 'website',
    twitterHandle = '@waveclipapp',
    noIndex = false,
}: SEOProps) {
    const fullTitle = title ? `${title} | Waveclip` : DEFAULT_TITLE;
    const absoluteImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;

    // Structured data for organization
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Waveclip',
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        sameAs: [
            'https://twitter.com/waveclipapp',
            'https://www.linkedin.com/company/waveclip',
        ],
    };

    // Structured data for the application
    const applicationSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Waveclip',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Web',
        description: DEFAULT_DESCRIPTION,
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
            description: 'Free tier with 5 exports per month',
        },
        featureList: [
            'AI-powered transcription',
            'Customizable waveform styles',
            'Multiple export formats',
            'Caption editing',
            'Brand customization',
        ],
    };

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords.join(', ')} />
            <link rel="canonical" href={url} />

            {/* Robots */}
            {noIndex && <meta name="robots" content="noindex, nofollow" />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={absoluteImage} />
            <meta property="og:site_name" content="Waveclip" />
            <meta property="og:locale" content="en_IN" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={url} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={absoluteImage} />
            <meta name="twitter:site" content={twitterHandle} />
            <meta name="twitter:creator" content={twitterHandle} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(organizationSchema)}
            </script>
            <script type="application/ld+json">
                {JSON.stringify(applicationSchema)}
            </script>
        </Helmet>
    );
}

// Pre-configured SEO for specific pages
export function LandingSEO() {
    return (
        <SEO
            description="Create stunning audiograms from your podcasts with AI-powered captions. Transform audio into viral social media videos in seconds. Free to start."
            keywords={[
                ...DEFAULT_KEYWORDS,
                'free audiogram maker',
                'podcast to video',
                'viral podcast clips',
            ]}
        />
    );
}

export function PricingSEO() {
    return (
        <SEO
            title="Pricing"
            description="Affordable plans for creators of all sizes. Start free with 5 exports/month or upgrade for unlimited audiograms. Pay in INR with UPI."
            keywords={['waveclip pricing', 'audiogram pricing', 'podcast video pricing', 'UPI payment']}
            url="https://waveclip.app/pricing"
        />
    );
}

export function DashboardSEO() {
    return (
        <SEO
            title="Dashboard"
            description="Manage your audiogram projects and create new ones."
            noIndex
        />
    );
}

export function EditorSEO({ projectName }: { projectName?: string }) {
    return (
        <SEO
            title={projectName ? `Editing: ${projectName}` : 'Editor'}
            description="Edit your audiogram with AI captions, waveform styling, and export options."
            noIndex
        />
    );
}

export function ExportSEO() {
    return (
        <SEO
            title="Export"
            description="Export your audiogram in multiple formats for social media."
            noIndex
        />
    );
}

export function SettingsSEO() {
    return (
        <SEO
            title="Settings"
            description="Manage your account, billing, and preferences."
            noIndex
        />
    );
}

export default SEO;
