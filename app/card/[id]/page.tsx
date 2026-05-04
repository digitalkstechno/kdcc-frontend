import React from 'react';
import MKGroupApp from '@/components/MKGroupApp';
import { Metadata } from 'next';

type CardPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: CardPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/v1/api";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${apiUrl}/builder/${id}`);
    const result = await response.json();
    
    if (result.status === "Success") {
      const builder = result.data;
      const baseUrl = apiUrl.split("/v1/api")[0];
      
      const title = builder.companyName || builder.name || "MK GROUP";
      const description = builder.name || "Digital Profile";
      const pageUrl = `${appUrl}/card/${id}`;

      // Use the direct profile image for the OG tag
      const imageUrl = builder.profileImage 
        ? `${baseUrl}/builder/${builder.profileImage}` 
        : builder.logo 
          ? `${baseUrl}/builder/${builder.logo}` 
          : `${appUrl}/api/og/${id}`; // Fallback to dynamic card if no profile photo

      return {
        title: title,
        description: description,
        metadataBase: new URL(appUrl),
        alternates: {
          canonical: `/card/${id}`,
        },
        openGraph: {
          title: title,
          description: description,
          url: pageUrl,
          siteName: 'MK GROUP',
          images: [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: title,
          description: description,
          images: [imageUrl],
        },
      };
    }
  } catch (error) {
    console.error("Metadata fetch error:", error);
  }

  return {
    title: "MK GROUP",
    description: "Digital Business Card",
  };
}

export default async function CardPage({ params }: CardPageProps) {
  const { id } = await params;
  return <MKGroupApp showAccessPanel={false} builderId={id} />;
}
