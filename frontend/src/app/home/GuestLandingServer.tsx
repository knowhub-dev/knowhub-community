import GuestLandingView from '@/components/home/GuestLandingView';

import { fetchHomeData } from './helpers/fetchHome';

export default async function GuestLandingServer() {
  const data = await fetchHomeData();

  return <GuestLandingView data={data} />;
}
