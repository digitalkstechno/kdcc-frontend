'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MobileFrame } from '@/components/MobileFrame';
import Link from 'next/link';
import { ShieldCheck, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  HomeView, 
  DashboardView, 
  AboutUsView, 
  AppointmentView, 
  PhotoGalleryView, 
  PopupView,
  ContactPersonView,
  LocationView,
  VideoGalleryView,
  BrochureView,
  InquiryView,
  DropboxView,
  AdvertisementView
} from '@/components/Views';

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

type MKGroupAppProps = {
  showAccessPanel?: boolean;
  builderId?: string;
};

export const BuilderContext = React.createContext<any>(null);

// Google Translate Component to inject the scripts
const GoogleTranslate = () => {
  useEffect(() => {
    // Correctly define the init function on windows
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          // Only include languages user requested
          includedLanguages: 'en,hi,gu',
          // Use a layout that's easy to hide if we want custom UI
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      );
    };

    // Load Google Translate script if not already there
    if (!document.getElementById('google-translate-script')) {
      const addScript = document.createElement('script');
      addScript.setAttribute('src', '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit');
      addScript.setAttribute('id', 'google-translate-script');
      document.body.appendChild(addScript);
    }
  }, []);

  return (
    <>
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }
        body {
          top: 0px !important;
        }
        .goog-te-gadget-icon {
          display: none !important;
        }
        .goog-te-gadget-simple {
          background-color: transparent !important;
          border: none !important;
        }
        .goog-te-menu-value span {
          display: none !important;
        }
        #goog-gt-tt {
          display: none !important;
        }
        .goog-tooltip {
          display: none !important;
        }
        .goog-tooltip:hover {
          display: none !important;
        }
        .goog-text-highlight {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </>
  );
};

export default function MKGroupApp({ showAccessPanel = true, builderId }: MKGroupAppProps) {
  const isMobile = useIsMobile();
  const [isLocalhostBooting, setIsLocalhostBooting] = useState<boolean>(false);
  const [builderData, setBuilderData] = useState<any>(null);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

  // Helper to change language using cookies (Google Translate standard approach)
  const changeLanguage = (langCode: string) => {
    // Reset toggle to OFF and force Home view when changing language
    try {
      localStorage.setItem('mkgroup:startFromHome', '0');
      localStorage.setItem('mkgroup:lastView', 'home');
    } catch (e) {}

    // Cookie format: /source_lang/target_lang
    const cookieValue = `/en/${langCode}`;
    
    // Set for current domain and subdomains
    const domain = window.location.hostname;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain}`;
    document.cookie = `googtrans=${cookieValue}; path=/;`;
    
    // Refresh to apply Google Translate changes
    window.location.reload();
  };

  useEffect(() => {
    if (builderId) {
      const loadBuilder = async () => {
        setIsDataLoading(true);
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/builder/${builderId}`);
          const result = await response.json();
          if (result.status === "Success") {
            setBuilderData(result.data);
          }
        } catch (error) {
          console.error("Failed to fetch builder data:", error);
        } finally {
          setIsDataLoading(false);
        }
      };
      loadBuilder();
    }
  }, [builderId]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [startFromHome, setStartFromHome] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('mkgroup:startFromHome');
      return stored == null ? false : stored === '1';
    } catch {
      return false;
    }
  });

  const [view, setView] = useState<View>(() => {
    try {
      const lastView = localStorage.getItem('mkgroup:lastView') as View | null;
      return lastView ?? 'home';
    } catch {
      return 'home';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mkgroup:startFromHome', startFromHome ? '1' : '0');
    } catch {
    }
  }, [startFromHome]);

  useEffect(() => {
    try {
      localStorage.setItem('mkgroup:lastView', view);
    } catch {
    }
  }, [view]);

  const renderView = () => {
    switch (view) {
      case 'home':
        return (
          <HomeView
            setView={setView}
            startFromHome={startFromHome}
            setStartFromHome={setStartFromHome}
            builderData={builderData}
            setIsEditMode={setIsEditMode}
          />
        );
      case 'dashboard': return <DashboardView setView={setView} openPopup={() => setIsPopupOpen(true)} changeLanguage={changeLanguage} setIsEditMode={setIsEditMode} />;
      case 'contact-person': return <ContactPersonView setView={setView} />;
      case 'about-us': return <AboutUsView setView={setView} />;
      case 'appointment': return <AppointmentView setView={setView} />;
      case 'location': return <LocationView setView={setView} />;
      case 'photo-gallery': return <PhotoGalleryView setView={setView} />;
      case 'video-gallery': return <VideoGalleryView setView={setView} />;
      case 'brochure': return <BrochureView setView={setView} />;
      case 'inquiry': return <InquiryView setView={setView} />;
      case 'dropbox': return <DropboxView setView={setView} isEditMode={isEditMode} setIsEditMode={setIsEditMode} />;
      case 'advertisement': return null; // handled via render prop in MobileFrame
      case 'popup': 
        return (
          <div className="relative h-full w-full overflow-hidden">
            <DashboardView setView={setView} changeLanguage={changeLanguage} />
            <div className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-[2px]">
               <PopupView setView={setView} />
            </div>
          </div>
        );
      default:
        return (
          <HomeView
            setView={setView}
            startFromHome={startFromHome}
            setStartFromHome={setStartFromHome}
            builderData={builderData}
          />
        );
    }
  };

  return (
    <BuilderContext.Provider value={builderData}>
    <GoogleTranslate />
    <div className={`relative min-h-screen ${isMobile ? 'bg-white' : 'bg-gray-50 flex items-center justify-center py-10'}`}>
      {showAccessPanel && (
        <div className="fixed top-8 left-8 z-50 flex flex-col gap-4">
          <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-white/50 shadow-xl flex flex-col gap-2">
            <Link
              href="/user/login"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-blue-50 text-blue-700 transition-all group"
            >
              <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200">
                <User size={18} />
              </div>
              <span className="text-sm font-bold">User Login</span>
            </Link>
            <Link
              href="/admin/login"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-purple-50 text-purple-700 transition-all group"
            >
              <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200">
                <ShieldCheck size={18} />
              </div>
              <span className="text-sm font-bold">Admin Login</span>
            </Link>
          </div>
        </div>
      )}

      <MobileFrame 
        currentView={view} 
        setView={setView} 
        setStartFromHome={setStartFromHome}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
      >
        {(adTab) => (
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              {view === 'advertisement' ? <AdvertisementView setView={setView} adTab={adTab} /> : renderView()}
            </motion.div>
          </AnimatePresence>
        )}
      </MobileFrame>

      {/* Popup Modal Overlay */}
      <AnimatePresence>
        {isPopupOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsPopupOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm"
            >
        <PopupView setView={() => setIsPopupOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </BuilderContext.Provider>
  );
}
