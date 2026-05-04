'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin, Menu, Share2, MessageCircle, Clock, Globe, Heart, CreditCard } from 'lucide-react';

type ViewPageProps = {
  params: Promise<{ id: string }>;
};

export default function ViewPage({ params }: ViewPageProps) {
  const [builderData, setBuilderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [id, setId] = useState<string>('');

  useEffect(() => {
    params.then(({ id }) => setId(id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/builder/${id}`)
      .then(r => r.json())
      .then(result => { if (result.status === 'Success') setBuilderData(result.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const getProfileImage = () => {
    if (builderData?.profileImage) {
      const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/v1/api').split('/v1/api')[0];
      return `${base}/builder/${builderData.profileImage}`;
    }
    return null;
  };

  const handleSaveContact = () => {
    const n = builderData?.name || 'MK GROUP';
    const vcf = `BEGIN:VCARD\nVERSION:3.0\nFN:${n}\nN:${n};;;;\nTEL;TYPE=CELL:${builderData?.number || ''}\nORG:${builderData?.companyName || ''}\nEND:VCARD`;
    const url = URL.createObjectURL(new Blob([vcf], { type: 'text/vcard' }));
    const a = document.createElement('a');
    a.href = url; a.download = `${n.replace(/\s+/g, '_')}.vcf`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    const profileUrl = window.location.href;
    if (navigator.share) {
      navigator.share({ title: builderData?.name || 'MK GROUP', url: profileUrl }).catch(() =>
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(profileUrl)}`, '_blank')
      );
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(profileUrl)}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#C56B36', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const img = getProfileImage();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-[490px] min-h-screen bg-white relative overflow-hidden">

        {/* Header */}
        <div className="flex justify-end px-4 pt-4">
          <div className="text-white px-4 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#C56B36' }}>
            Total View : {builderData?.viewCount || 0}
          </div>
          <Menu className="ml-3 text-gray-700" size={24} />
        </div>

        <div className="px-6 pb-8">
          {/* Profile + Buttons */}
          <div className="flex items-center gap-6 mb-4">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 p-1 flex-shrink-0" style={{ borderColor: '#C56B3633' }}>
              {img ? (
                <Image src={img} alt={builderData?.name || 'Profile'} width={160} height={160} className="rounded-full object-cover w-full h-full" priority unoptimized />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={48} className="text-gray-300" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex gap-2 items-center">
                <button onClick={handleSaveContact} className="flex items-center justify-center gap-2 text-white px-4 h-10 rounded-full font-semibold text-sm" style={{ backgroundColor: '#C56B36' }}>
                  <User size={16} /> Save Contact
                </button>
                <button onClick={() => { const n = builderData?.number; if (n) window.open(`tel:${n}`, '_self'); }} className="flex items-center justify-center h-10 w-10 rounded-full border-2" style={{ borderColor: '#C56B36', color: '#C56B36' }}>
                  <Phone size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Name & Designation */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-0.5" style={{ color: '#C56B36' }}>{builderData?.name || 'Name'}</h1>
            {builderData?.designation && <p className="text-gray-900 text-sm font-medium">{builderData.designation}</p>}
          </div>

          {/* Contact Fields */}
          <div className="space-y-3">
            {builderData?.email && (
              <div className="border-2 rounded-xl p-4 flex items-center gap-4" style={{ borderColor: '#C56B36' }}>
                <Mail size={24} style={{ color: '#C56B36' }} />
                <span className="text-gray-800 font-medium text-lg flex-1">{builderData.email}</span>
                <ChevronRight size={20} style={{ color: '#C56B36' }} />
              </div>
            )}
            {(builderData?.whatsappNumber || builderData?.number) && (
              <div className="border-2 rounded-xl p-4 flex items-center gap-4" style={{ borderColor: '#C56B36' }}>
                <MessageCircle size={24} style={{ color: '#C56B36' }} />
                <span className="text-gray-800 font-medium text-lg flex-1">{builderData?.whatsappNumber || builderData?.number}</span>
                <ChevronRight size={20} style={{ color: '#C56B36' }} />
              </div>
            )}
            {builderData?.number && (
              <div className="border-2 rounded-xl p-4 flex items-center gap-4" style={{ borderColor: '#C56B36' }}>
                <Phone size={24} style={{ color: '#C56B36' }} />
                <span className="text-gray-800 font-medium text-lg flex-1">{builderData.number}</span>
                <ChevronRight size={20} style={{ color: '#C56B36' }} />
              </div>
            )}
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
                <ChevronRight size={20} style={{ color: '#C56B36' }} />
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

          {/* Share */}
          <div className="flex gap-4 mt-6 p-4 bg-gray-100 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-3">
                <span className="text-2xl">🇮🇳</span>
                <input type="text" placeholder="Enter whatsapp number" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="flex-1 outline-none text-gray-600" />
              </div>
            </div>
            <button onClick={handleShare} className="bg-green-500 text-white px-6 rounded-lg flex items-center gap-2 font-semibold hover:bg-green-600 transition-colors">
              <Share2 size={20} /> Share
            </button>
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
