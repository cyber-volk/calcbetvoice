import React from 'react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

interface LineChartProps {
  data: Array<{
    name: string
    value: number
  }>
}

export function LineChart({ data }: LineChartProps) {
  return (
    <RechartsLineChart width={500} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#8884d8" />
    </RechartsLineChart>
  )
} 