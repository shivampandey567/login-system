"use client"

import { useState } from 'react'
import OtpVerificationCard from '@/components/otpVerificationCard'
import SignInCard from '@/components/SignInCard'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const Page = () => {
  const [step, setStep] = useState<"credentials" | "otp">("credentials")
  const [email, setEmail] = useState("")

  return (
    <div className='w-full h-full flex items-center justify-center p-4'>
      <Link href="/">
        <Button className='absolute top-3 left-4' variant="ghost"><ChevronLeft />Home</Button>
      </Link>

      {step === "credentials" ? (
        <SignInCard onOtpSent={(sentEmail) => { setEmail(sentEmail); setStep("otp") }} />
      ) : (
        <OtpVerificationCard email={email} onBack={() => setStep("credentials")} />
      )}
    </div>
  )
}

export default Page