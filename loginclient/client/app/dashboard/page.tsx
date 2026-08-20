import UserInfoCard from '@/components/UserInfoCard'
import PasswordForm from '@/components/PasswordForm'
import { getUser } from '@/lib/getUser';
import { redirect } from 'next/navigation';

const Page = async () => {
  const user = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className='w-full h-full flex flex-col items-center justify-center gap-6 p-4'>
      <UserInfoCard user={user} />
      <PasswordForm hasPassword={user.hasPassword} />
    </div>
  )
}

export default Page