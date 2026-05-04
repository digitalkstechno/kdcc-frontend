import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/v1/api";
    const response = await fetch(`${apiUrl}/builder/${id}`);
    const result = await response.json();

    if (result.status !== "Success") {
      return new Response("Profile not found", { status: 404 });
    }

    const builder = result.data;
    const baseUrl = apiUrl.split("/v1/api")[0];
    
    // Priority for avatar image
    const avatarUrl = builder.profileImage 
      ? `${baseUrl}/builder/${builder.profileImage}` 
      : builder.logo 
        ? `${baseUrl}/builder/${builder.logo}` 
        : "https://via.placeholder.com/200";

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            backgroundImage: 'radial-gradient(circle at 25% 25%, #e2e8f0 0%, transparent 50%), radial-gradient(circle at 75% 75%, #e2e8f0 0%, transparent 50%)',
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: '40px',
              padding: '60px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e2e8f0',
              width: '1000px',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                display: 'flex',
                width: '240px',
                height: '240px',
                borderRadius: '120px',
                overflow: 'hidden',
                marginRight: '60px',
                border: '8px solid #f1f5f9',
              }}
            >
              <img
                src={avatarUrl}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>

            {/* Content */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
              <h1
                style={{
                  fontSize: '64px',
                  fontWeight: '900',
                  color: '#0f172a',
                  margin: '0 0 10px 0',
                  letterSpacing: '-0.05em',
                }}
              >
                {builder.name || "MK GROUP"}
              </h1>
              <h2
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#3b82f6',
                  margin: '0 0 20px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                {builder.companyName || "Digital Profile"}
              </h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <p style={{ fontSize: '24px', color: '#64748b', margin: 0, fontWeight: '600' }}>
                  📍 {builder.location || "Available Worldwide"}
                </p>
                <p style={{ fontSize: '24px', color: '#64748b', margin: 0, fontWeight: '600' }}>
                  📞 {builder.number || "-"}
                </p>
                <p style={{ fontSize: '24px', color: '#64748b', margin: 0, fontWeight: '600' }}>
                  🌐 {builder.website || "Open Profile"}
                </p>
              </div>
            </div>
          </div>
          
          <div style={{
            position: 'absolute',
            bottom: '40px',
            right: '60px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '6px', backgroundColor: '#3b82f6' }}></div>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em' }}>MK GROUP DIGITAL CARD</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
