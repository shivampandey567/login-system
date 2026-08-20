"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent } from './ui/card'
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Field, FieldDescription, FieldLabel } from './ui/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp'
import { Button } from './ui/button'

interface OtpVerificationCardProps {
  email: string
  onBack: () => void
}

const RESEND_SECONDS = 60

const OtpVerificationCard = ({ email, onBack }: OtpVerificationCardProps) => {
  const router = useRouter()
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(interval)
  }, [secondsLeft])

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Invalid or expired code")
        return
      }

      toast.success("Verified")
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (secondsLeft > 0) return

    const res = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (!res.ok) {
      toast.error("Failed to resend OTP")
      return
    }

    toast.success("OTP resent")
    setSecondsLeft(RESEND_SECONDS)
  }

  return (
    <Card className='w-full sm:max-w-md'>
      <CardContent>
        <Field className="w-full">
          <FieldLabel htmlFor="digits-only" className='text-lg'>OTP verification</FieldLabel>
          <FieldDescription>Enter the 6-digit code sent to {email}.</FieldDescription>

          <InputOTP
            id="digits-only"
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            value={otp}
            onChange={setOtp}
          >
            <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-11 *:data-[slot=input-otp-slot]:w-10 *:data-[slot=input-otp-slot]:text-lg mx-auto mt-4">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <div className='flex justify-between items-center mt-2'>
            <span className='text-sm text-muted-foreground cursor-pointer' onClick={onBack}>
              Back
            </span>
            <span
              className={secondsLeft > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-500 cursor-pointer'}
              onClick={handleResend}
            >
              {secondsLeft > 0 ? `Resend OTP in ${secondsLeft}s` : 'Resend OTP'}
            </span>
          </div>

          <Button size="lg" className='mt-4' onClick={handleVerify} disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </Field>
      </CardContent>
    </Card>
  )
}

export default OtpVerificationCard