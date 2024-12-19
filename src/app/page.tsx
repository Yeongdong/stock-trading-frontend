import { redirect } from 'next/navigation';

export default async function Home() {
  console.log("home confirmed")
  redirect('/login');
}