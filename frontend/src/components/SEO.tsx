import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  product?: {
    price?: string;
    currency?: string;
    availability?: string;
    condition?: string;
  };
}

export default function SEO({
  title = 'Echo - Modern Social Platform',
  description = 'Connect, share, and discover with Echo. A modern social platform bringing people together through meaningful conversations and shared experiences.',
  keywords = 'social media, social platform, connect, share, discover, community, Echo, dairy farm management, shopping, ecommerce',
  image = '/images/og-image.jpg',
  url = 'https://echo.com',
  type = 'website',
  author = 'Echo Team',
  publishedTime,
  modifiedTime,
  product,
}: SEOProps) {
  const fullTitle = title.includes('Echo') ? title : `${title} | Echo`;

  // Structured data for better SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'product' ? 'Product' : 'WebSite',
    name: title,
    description,
    url,
    image,
    ...(type === 'product' &&
      product && {
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency || 'INR',
          availability: `https://schema.org/${product.availability || 'InStock'}`,
          itemCondition: `https://schema.org/${product.condition || 'NewCondition'}`,
        },
      }),
    ...(type === 'website' && {
      potentialAction: {
        '@type': 'SearchAction',
        target: `${url}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    }),
  };

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English, Hindi, Punjabi" />
      <meta name="revisit-after" content="7 days" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Echo" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="hi_IN" />
      <meta property="og:locale:alternate" content="pa_IN" />

      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:creator" content="@EchoSocial" />

      {/* Mobile */}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
      />
      <meta name="theme-color" content="#667eea" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
      <meta name="apple-mobile-web-app-title" content="Echo" />

      {/* PWA */}
      <link rel="manifest" href="/manifest.json" />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  );
}
