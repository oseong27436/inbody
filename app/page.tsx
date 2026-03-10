import { supabase } from '@/lib/supabase'
import InbodyDashboard from '@/app/components/InbodyDashboard'

export const revalidate = 0

export default async function Home() {
  const { data: records } = await supabase
    .from('inbody_records')
    .select('*')
    .order('date', { ascending: true })

  return <InbodyDashboard records={records ?? []} />
}
