'use client';

import React, { useContext } from 'react';
import { Home, Box, Share2, ChevronLeft, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { BuilderContext } from '@/components/MKGroupApp';

type View =
  | 'home'
  | 'dashboard'
  | 'contact-person'
  | 'about-us'
  | 'appointment'
  | 'location'
  | 'photo-gallery'
  | 'video-gallery'
  | 'brochure'
  | 'inquiry'
  | 'dropbox'
  | 'advertisement'
  | 'popup';

interface MobileFrameProps {
  children: (adTab?: 'Advertisement' | 'Running' | 'Upcoming') => React.ReactNode;
  currentView: View;
  setView: (v: View) => void;
  setStartFromHome?: (v: boolean) => void;
  isEditMode?: boolean;
  setIsEditMode?: (v: boolean) => void;
}

const VIEW_LABELS: Record<string, string> = {
  'contact-person': 'Contact Person',
  'about-us': 'About Us',
  'appointment': 'Appointment',
  'location': 'Location',
  'photo-gallery': 'Photo Gallery',
  'video-gallery': 'Video Gallery',
  'brochure': 'Brochure',
  'inquiry': 'Inquiry',
  'dropbox': 'Dropbox',
  'advertisement': 'Advertisement',
  'popup': 'Popup',
};

export const MobileFrame = ({ children, currentView, setView, setStartFromHome, isEditMode, setIsEditMode }: MobileFrameProps) => {
  const isHome = currentView === 'home';
  const isDashboard = currentView === 'dashboard';
  const isPopup = currentView === 'popup';
  const isAdvertisement = currentView === 'advertisement';
  const isSubView = !isHome && !isDashboard && !isPopup;
  const isMobile = useIsMobile();
  const [adTab, setAdTab] = React.useState<'Advertisement' | 'Running' | 'Upcoming'>('Advertisement');
  const builderData = useContext(BuilderContext);

  const handleShare = async () => {
    if (typeof window === 'undefined') return;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const publicProfileUrl = `${appUrl}/card/${builderData?._id}`;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1/api';
    const baseUrl = apiUrl.split('/v1/api')[0];
    
    // Priority: Profile Image > Logo
    const imageUrl = builderData?.profileImage
      ? `${baseUrl}/builder/${builderData.profileImage}`
      : builderData?.logo
        ? `${baseUrl}/builder/${builderData.logo}`
        : '';

    const shareText = `${publicProfileUrl}\n\n` +
      `*${builderData?.companyName || 'MK GROUP'}*\n\n` +
      `*Name:* ${builderData?.name || '-'}\n` +
      `*Location:* ${builderData?.location || '-'}\n` +
      `${builderData?.timing ? `*Timing:* ${builderData.timing}\n` : ''}` +
      `\nOpen this digital card now!`;

    const shareData = {
      title: builderData?.companyName || 'MK GROUP',
      text: shareText,
      url: publicProfileUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData as ShareData);
      } catch {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
      }
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  return (
    <div className={`min-h-screen ${isMobile ? 'bg-white' : 'bg-gray-50 flex items-center justify-center p-4'} font-sans`}>
      {/* Phone Shell */}
      <div className={`${isMobile ? 'w-full h-full' : 'relative w-[400px] flex-shrink-0 bg-[#B0CADA] rounded-[60px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-[12px] border-[8px] border-white/30'}`}>
        {/* Screen — fixed height on desktop, fixed viewport height on mobile to enable internal scroll */}
        <div
          className={`relative bg-[#B3D0E2] overflow-hidden flex flex-col ${isMobile ? 'h-[100dvh] max-h-[100dvh]' : 'rounded-[48px] shadow-inner'}`}
          style={isMobile ? {} : { height: '820px', minHeight: '820px', maxHeight: '820px' }}
        >

       
          {/* Scrollable Content */}
          <div className={`flex-1 overflow-y-auto scrollbar-hide flex flex-col ${isMobile ? 'max-w-md mx-auto w-full' : ''}`}>
            {children(isAdvertisement ? adTab : undefined)}
          </div>

          {/* Bottom Nav — Dashboard */}
          {isDashboard && !isPopup && (
           <div className={`flex-shrink-0 bg-[#004A7C] border-t border-white/10 shadow-[0_-8px_20px_rgba(0,0,0,0.15)] ${isMobile ? 'fixed bottom-0 left-0 right-0  z-40' : 'rounded-b-[48px]'}`}>
              <div className="flex items-center justify-around py-2 px-2">
                {[
                  { icon: Home, label: 'home', action: () => {
                    setView('home');
                    if (setStartFromHome) setStartFromHome(false);
                  } },
                  { icon: Box, label: 'dropbox', action: () => setView('dropbox') },
                  { icon: FileText, label: 'correction', action: () => window.open('/user/login', '_blank') },
                  { icon: Share2, label: 'share', action: handleShare },
                ].map(({ icon: Icon, label, action }) => (
                  <button key={label} onClick={action} className="flex flex-col items-center gap-1 py-1 px-3 text-white/90 hover:text-white transition-all group">
                    <Icon size={22} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Bottom Nav — Subviews */}
          {isSubView && (
            <div className={`flex-shrink-0 bg-[#6B849E] py-2 px-4 flex items-center shadow-[0_-8px_20px_rgba(0,0,0,0.15)] ${isMobile ? 'fixed bottom-0 left-0 right-0 z-40' : 'rounded-b-[48px]'} min-h-[56px] relative`}>
              <button
                onClick={() => {
                  if (isEditMode) {
                    if (setIsEditMode) setIsEditMode(false);
                    setView('home');
                  } else {
                    setView('dashboard');
                  }
                }}
                className="flex-shrink-0 text-white hover:opacity-80 transition-opacity z-10"
              >
                <ChevronLeft size={32} strokeWidth={4} />
              </button>

              {!isAdvertisement ? (
                <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-lg tracking-wide pointer-events-none">
                  {VIEW_LABELS[currentView] || 'Important Message'}
                </div>
              ) : (
                <div className="flex flex-1 justify-around ml-2 z-10">
                  {(['Advertisement', 'Running', 'Upcoming'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setAdTab(tab)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                        adTab === tab
                          ? 'bg-white text-[#003B46]'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
