'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin, Menu, Share2, MessageCircle, Clock, Globe, Heart, CreditCard } from 'lucide-react';

type Props = {
  params: Promise<{ serial: string; slug: string }>;
};

export default function SerialSlugViewPage({ params }: Props) {
  const [builderData, setBuilderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [slug, setSlug] = useState('');
  const [serial, setSerial] = useState('');

  useEffect(() => {
    const load = async () => {
      const { serial, slug } = await params;
      setSerial(serial);
      setSlug(slug);
    };
    load();
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/builder/by-serial/${serial}/${slug}`);
        const result = await response.json();
        if (result.status === 'Success') setBuilderData(result.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [serial, slug]);

  const getProfileImage = () => {
    if (builderData?.profileImage) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1/api';
      const baseUrl = apiUrl.split('/v1/api')[0];
      return `${baseUrl}/builder/${builderData.profileImage}`;
    }
    return null;
  };

  const handleSaveContact = () => {
    const n = builderData?.name || 'MK GROUP';
    const tel = builderData?.number || '';
    const org = builderData?.companyName || '';
    const vcf = `BEGIN:VCARD\nVERSION:3.0\nFN:${n}\nN:${n};;;;\nTEL;TYPE=CELL:${tel}\nORG:${org}\nEND:VCARD`;
    const blob = new Blob([vcf], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${n.replace(/\s+/g, '_')}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    const profileUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/${serial}/${slug}`;
    const num = whatsappNumber.replace(/\D/g, '');
    if (num) {
      window.open(`https://wa.me/${num}?text=${profileUrl}`, '_blank');
    } else {
      if (navigator.share) {
        navigator.share({ title: builderData?.name || 'MK GROUP', url: profileUrl }).catch(() => {
          window.open(`https://wa.me/?text=${encodeURIComponent(profileUrl)}`, '_blank');
        });
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(profileUrl)}`, '_blank');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#C56B36', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-[490px] min-h-screen bg-white relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-end px-4 pt-4">
          <div className="text-white px-4 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#C56B36' }}>
            Total View : {builderData?.viewCount || 0}
          </div>
          <div className="relative ml-3">
            <Menu className="text-gray-700 cursor-pointer" size={24} onClick={() => setMenuOpen(!menuOpen)} />
            {menuOpen && (
              <div className="absolute right-0 top-8 cursor-pointer bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-44">
                <button onClick={() => { window.open('https://www.khedadccb.bank.in/', '_blank'); setMenuOpen(false); }} className="w-full flex items-center gap-2  cursor-pointer px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl">
                  <Globe size={16} style={{ color: '#C56B36'  }} /> View Site
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 p-1 flex-shrink-0" style={{ borderColor: '#C56B3633' }}>
              {getProfileImage() ? (
                <Image src={getProfileImage()!} alt={builderData?.name || 'Profile'} width={112} height={112} className="rounded-full object-cover w-full h-full" priority unoptimized />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={40} className="text-gray-300" />
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-1 min-w-0 justify-end">
                <button onClick={handleSaveContact} className="flex items-center justify-center gap-2 text-white px-4 h-10 rounded-full font-semibold text-sm" style={{ backgroundColor: '#C56B36' }}>
                <User size={16} /> Save Contact
              </button>
              {/* <button onClick={() => { const num = builderData?.number; if (num) window.open(`tel:${num}`, '_self'); }} className="flex items-center justify-center h-10 w-10 rounded-full border-2 flex-shrink-0" style={{ borderColor: '#C56B36', color: '#C56B36' }}>
                <Phone size={16} strokeWidth={2.5} />
              </button> */}
            </div>
          </div>

          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-0.5" style={{ color: '#C56B36' }}>{builderData?.name || 'Name'}</h1>
            <p className="text-gray-900 text-sm font-medium">{builderData?.designation || ''}</p>
          </div>

          <div className="space-y-4">
            <div className="border-2 rounded-xl p-4 flex items-center gap-4 cursor-pointer" style={{ borderColor: '#C56B36' }} onClick={() => { if (builderData?.email) window.open(`https://mail.google.com/mail/?view=cm&to=${builderData.email}`, '_blank'); }}>
              <Mail size={24} style={{ color: '#C56B36' }} />
              <span className="text-gray-800 font-medium text-lg">{builderData?.email}</span>
              <ChevronRight className="ml-auto" size={20} style={{ color: '#C56B36' }} />
            </div>
            <div className="border-2 rounded-xl p-4 flex items-center gap-4 cursor-pointer" style={{ borderColor: '#C56B36' }} onClick={() => { const num = builderData?.whatsappNumber || builderData?.number; if (num) window.open(`https://wa.me/${num.replace(/\D/g, '')}`, '_blank'); }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#C56B36"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <span className="text-gray-800 font-medium text-lg">{builderData?.whatsappNumber || builderData?.number}</span>
              <ChevronRight className="ml-auto" size={20} style={{ color: '#C56B36' }} />
            </div>
            <div className="border-2 rounded-xl p-4 flex items-center gap-4 cursor-pointer" style={{ borderColor: '#C56B36' }} onClick={() => { if (builderData?.number) window.open(`tel:${builderData.number}`, '_self'); }}>
              <Phone size={24} style={{ color: '#C56B36' }} />
              <span className="text-gray-800 font-medium text-lg">{builderData?.number}</span>
              <ChevronRight className="ml-auto" size={20} style={{ color: '#C56B36' }} />
            </div>
            {builderData?.location && (
              <div className="border-2 rounded-xl p-4 flex items-start gap-4" style={{ borderColor: '#C56B36' }}>
                <Menu className="mt-1" size={24} style={{ color: '#C56B36' }} />
                <span className="text-gray-800 font-medium text-lg leading-relaxed flex-1">{builderData.location}</span>
              </div>
            )}
            {builderData?.homeAddress && (
              <div className="border-2 rounded-xl p-4 flex items-start gap-4" style={{ borderColor: '#C56B36' }}>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase mb-1" style={{ color: '#C56B36' }}>Home</span>
                  <MapPin size={24} style={{ color: '#C56B36' }} />
                </div>
                <span className="text-gray-800 font-medium text-lg leading-relaxed flex-1 mt-4">{builderData.homeAddress}</span>
                <ChevronRight className="mt-4" size={20} style={{ color: '#C56B36' }} />
              </div>
            )}
            {builderData?.timing && (
              <div className="border-2 rounded-xl p-4 flex items-center gap-4" style={{ borderColor: '#C56B36' }}>
                <Clock size={24} style={{ color: '#C56B36' }} />
                <span className="text-gray-800 font-medium text-lg flex-1">{builderData.timing}</span>
              </div>
            )}
            {builderData?.website && (
              <div className="border-2 rounded-xl p-4 flex items-center gap-4" style={{ borderColor: '#C56B36' }}>
                <Globe size={24} style={{ color: '#C56B36' }} />
                <span className="text-gray-800 font-medium text-lg flex-1 break-all">{builderData.website}</span>
                <ChevronRight className="ml-auto" size={20} style={{ color: '#C56B36' }} />
              </div>
            )}
            {builderData?.bloodGroup && (
              <div className="border-2 rounded-xl p-4 flex items-center gap-4" style={{ borderColor: '#C56B36' }}>
                <Heart size={24} style={{ color: '#C56B36' }} />
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase text-gray-400 mb-0.5">Blood Group</p>
                  <span className="text-gray-800 font-medium text-lg">{builderData.bloodGroup}</span>
                </div>
              </div>
            )}
            {builderData?.aadharNumber && (
              <div className="border-2 rounded-xl p-4 flex items-center gap-4" style={{ borderColor: '#C56B36' }}>
                <CreditCard size={24} style={{ color: '#C56B36' }} />
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase text-gray-400 mb-0.5">Aadhar Number</p>
                  <span className="text-gray-800 font-medium text-lg">{builderData.aadharNumber}</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-center mt-6">
{/* Social Icons Row - only show if any link exists */}
            {(builderData?.instagramLink || builderData?.facebookLink || builderData?.youtubeLink || builderData?.linkedinLink || builderData?.twitterLink) && (
              <div className="flex gap-3 justify-center py-2">
                {builderData?.instagramLink && (
                  <button onClick={() => window.open(builderData.instagramLink, '_blank')} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E1306C' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </button>
                )}
                {builderData?.facebookLink && (
                  <button onClick={() => window.open(builderData.facebookLink, '_blank')} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1877F2' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </button>
                )}
                {builderData?.youtubeLink && (
                  <button onClick={() => window.open(builderData.youtubeLink, '_blank')} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF0000' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </button>
                )}
                {builderData?.linkedinLink && (
                  <button onClick={() => window.open(builderData.linkedinLink, '_blank')} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0A66C2' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </button>
                )}
                {builderData?.twitterLink && (
                  <button onClick={() => window.open(builderData.twitterLink, '_blank')} className="w-10 h-10 rounded-full flex items-center justify-center bg-black">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </button>
                )}
              </div>
            )}
            </div>
          <div className="flex flex-col gap-3 mt-6 p-4 bg-gray-100 rounded-lg">
            
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <input type="text" placeholder="Enter whatsapp number" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="flex-1 outline-none text-gray-600 text-sm" />
            </div>
            <button onClick={handleShare} className="w-full bg-green-500 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-semibold hover:bg-green-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Share
            </button>
          </div>

          <div className="text-center mt-6 pb-2">
            <p className="text-xs text-gray-400">Powered By <span className="font-bold cursor-pointer" style={{ color: '#C56B36' }} onClick={() => window.open('https://www.khedadccb.bank.in/', '_blank')}>khedadccb.bank</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function User(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
}

function ChevronRight(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;
}
