'use client';

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation';

const Home = () => {

  const router = useRouter()
  useEffect(() => {
    router.push('/admin/login')
  }, [])
  return (
    <></>
    // <div>Home</div>
  )
}

export default Home