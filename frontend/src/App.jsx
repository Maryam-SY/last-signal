import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Rocket } from 'lucide-react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex items-center gap-2 text-2xl font-semibold">
        <Rocket className="h-6 w-6" />
        AeroReborn
      </div>
      <Button onClick={() => setCount((c) => c + 1)}>
        Count is {count}
      </Button>
    </main>
  )
}

export default App