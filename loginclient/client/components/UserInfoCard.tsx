"use client"

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/lib/getUser";

const UserInfoCard = ({ user }: { user: UserProfile }) => {
    const displayName = user.name || user.email.split("@")[0];
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <Card className="max-w-full sm:max-w-md">
            <CardContent className="flex flex-col gap-4">
                {user.picture ? (
                    <Image
                        src={user.picture}
                        alt={displayName}
                        width={80}
                        height={80}
                        className="rounded-full mx-auto"
                    />
                ) : (
                    <div className="w-20 h-20 rounded-full bg-neutral-200 flex items-center justify-center text-2xl font-semibold text-neutral-600 mx-auto">
                        {initial}
                    </div>
                )}
                <div className="flex flex-col">
                    <h2 className="text-lg font-semibold mx-auto">{displayName}</h2>
                    <p className="text-neutral-500 mx-auto">{user.email}</p>
                </div>

                <form action="/api/auth/logout" method="POST" className="mx-auto">
                    <Button variant="secondary">
                        Log out
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default UserInfoCard