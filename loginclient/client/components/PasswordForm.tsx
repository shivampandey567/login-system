"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Eye, EyeOff, LockKeyhole } from "lucide-react"

const PasswordForm = ({ hasPassword }: { hasPassword: boolean }) => {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (hasPassword && !currentPassword) {
      toast.error("Enter your current password")
      return
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters")
      return
    }

    setLoading(true)
    const res = await fetch("/api/user/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    setLoading(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || "Failed to update password")
      return
    }

    toast.success(hasPassword ? "Password updated" : "Password set")
    setCurrentPassword("")
    setNewPassword("")
  }

  return (
    <Card className="w-full sm:max-w-md">
      <CardContent>
        <h3 className="text-lg font-semibold mb-4">
          {hasPassword ? "Change password" : "Set a password"}
        </h3>

        <FieldGroup>
          {hasPassword && (
            <Field>
              <FieldLabel>Current password</FieldLabel>
              <InputGroup className="min-h-12 rounded-full p-2">
                <InputGroupInput
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <InputGroupAddon align="inline-start">
                  <LockKeyhole />
                </InputGroupAddon>
                <InputGroupButton type="button" variant="secondary" size="icon-sm" onClick={() => setShowCurrent((p) => !p)}>
                  {showCurrent ? <EyeOff /> : <Eye />}
                </InputGroupButton>
              </InputGroup>
            </Field>
          )}

          <Field>
            <FieldLabel>New password</FieldLabel>
            <InputGroup className="min-h-12 rounded-full p-2">
              <InputGroupInput
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <InputGroupAddon align="inline-start">
                <LockKeyhole />
              </InputGroupAddon>
              <InputGroupButton type="button" variant="secondary" size="icon-sm" onClick={() => setShowNew((p) => !p)}>
                {showNew ? <EyeOff /> : <Eye />}
              </InputGroupButton>
            </InputGroup>
          </Field>
        </FieldGroup>

        <Button className="w-full mt-6 min-h-12" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : hasPassword ? "Update password" : "Set password"}
        </Button>
      </CardContent>
    </Card>
  )
}

export default PasswordForm