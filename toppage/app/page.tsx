import Image from 'next/image'
import Drawer from './components/Drawer/page'
import Ranking from './components/Ranking/page'
import Adsence from './components/Adsence/page'

export default function Home() {
  return (
    <main className='flex justify-around'>
      <Drawer />
      <Ranking />
      <div className='w-3/6 mt-10'>
      <Adsence />
      <Adsence />
      <Adsence />
      <Adsence />
      </div>

    </main>
  )
}
