import Image from 'next/image'
import Drawer from './components/Drawer/page'
import Ranking from './components/Ranking/page'

export default function Home() {
  return (
    <main>
      <Drawer />
      <Ranking />
    </main>
  )
}
