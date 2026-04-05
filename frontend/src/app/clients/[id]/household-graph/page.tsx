import { redirect } from 'next/navigation'

export default async function HouseholdGraphRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/build/household/${id}`)
}
