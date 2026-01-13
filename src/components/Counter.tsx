import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-3xl font-bold">Counter</h2>
      <div className="text-6xl font-bold text-slate-900">{count}</div>
      <div className="flex gap-4">
        <Button onClick={() => setCount(count - 1)} variant="outline">
          Decrement
        </Button>
        <Button onClick={() => setCount(0)} variant="ghost">
          Reset
        </Button>
        <Button onClick={() => setCount(count + 1)}>
          Increment
        </Button>
      </div>
    </div>
  )
}
