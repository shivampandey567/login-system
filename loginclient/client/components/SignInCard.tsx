"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldGroup } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface SignInCardProps {
  onOtpSent: (email: string) => void
}

const SignInCard = ({ onOtpSent }: SignInCardProps) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [loading, setLoading] = useState(false)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Enter your email")
      return
    }

    if (showPasswordField) {
      if (!password) {
        toast.error("Enter your password")
        return
      }

      setLoading(true)
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          toast.error(data.error || "Login failed")
          return
        }

        toast.success("Logged in")
        window.location.href = "/dashboard"
      } finally {
        setLoading(false)
      }
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Failed to send OTP")
        return
      }

      toast.success("OTP sent to your email")
      onOtpSent(email)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className='min-w-full sm:min-w-md'>
      <CardContent>
        <Button
          className='w-full'
          variant="secondary"
          size="lg"
          onClick={() => {
            window.location.href = `${backendUrl}/oauth2/authorization/google`
          }}
        >
          <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleLogo.svg" alt="googleLogo" />
        </Button>

        <div className="flex items-center gap-4 w-full my-5">
          <div className="w-full h-px bg-gray-300/90"></div>
          <p className="w-full text-nowrap text-sm text-gray-500/90">or sign in with email</p>
          <div className="w-full h-px bg-gray-300/90"></div>
        </div>

        <FieldGroup className="max-w-full">
          <Field>
            <InputGroup className='min-h-12 rounded-full p-2'>
              <InputGroupInput
                id="inline-end-input"
                type="email"
                placeholder="Email id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <InputGroupAddon align="inline-start">
                <Mail />
              </InputGroupAddon>
            </InputGroup>
          </Field>

          <Field className={showPasswordField ? 'block' : 'hidden'}>
            <InputGroup className="min-h-12 rounded-full p-2">
              <InputGroupInput
                id="inline-end-input"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputGroupAddon align="inline-start">
                <LockKeyhole />
              </InputGroupAddon>
              <InputGroupButton
                type="button"
                variant="secondary"
                size="icon-sm"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className='text-muted-foreground'
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </InputGroupButton>
            </InputGroup>
          </Field>
        </FieldGroup>

        <div className='w-full flex justify-end mt-6'>
          <span
            className='text-indigo-500 font-medium cursor-pointer'
            onClick={() => setShowPasswordField((prev) => !prev)}
          >
            {showPasswordField ? 'Forgot password' : 'Use password'}
          </span>
        </div>

        <Button size="lg" className='w-full mt-8 min-h-12 text-[15px]' onClick={handleSubmit} disabled={loading}>
          {loading ? "Please wait..." : "Login"}
        </Button>
      </CardContent>
    </Card>
  )
}

export default SignInCard