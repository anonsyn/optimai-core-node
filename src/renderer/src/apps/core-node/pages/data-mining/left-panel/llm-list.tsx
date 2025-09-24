import { Card, CardContent, CardTitle } from '@core-node/pages/data-mining/card'
import { motion } from 'framer-motion'

const supportedLLMs = [
  'LLama 3.2 Vision',
  'Mistral',
  'LLama 3.3',
  'Phi 4',
  'Neural Chat',
  'Gemma 2'
]

export const LLMList = () => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <Card>
        <CardTitle>Supported LLMs</CardTitle>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {supportedLLMs.map((llm, index) => (
              <motion.div
                key={llm}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 + index * 0.03 }}
                className="text-13 bg-accent/40 rounded-3xl border border-white/10 px-2.5 py-[5px] text-white/70"
              >
                {llm}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
