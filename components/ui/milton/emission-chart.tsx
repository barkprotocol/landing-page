import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line } from 'react-chartjs-2'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface EmissionChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension: number;
      fill: boolean;
    }[];
  };
}

export default function EmissionChart({ data }: EmissionChartProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Emission Schedule</CardTitle>
          <CardDescription>Projected token release over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64 sm:h-80">
            <ChartContainer
              config={{
                circulatingSupply: {
                  label: 'Circulating Supply',
                  color: 'hsl(var(--chart-1))',
                },
                maxSupply: {
                  label: 'Max Supply',
                  color: 'hsl(var(--chart-2))',
                },
              }}
            >
              <Line 
                data={data} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Token Supply',
                        font: {
                          size: 12,
                          weight: 'bold'
                        }
                      },
                      ticks: {
                        font: {
                          size: 10
                        },
                        callback: function(value) {
                          return value.toLocaleString() + ' M';
                        }
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Time',
                        font: {
                          size: 12,
                          weight: 'bold'
                        }
                      },
                      ticks: {
                        font: {
                          size: 10
                        }
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'top' as const,
                      labels: {
                        font: {
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      mode: 'index' as const,
                      intersect: false,
                      titleFont: {
                        size: 14
                      },
                      bodyFont: {
                        size: 12
                      },
                      callbacks: {
                        label: function(context) {
                          let label = context.dataset.label || '';
                          if (label) {
                            label += ': ';
                          }
                          if (context.parsed.y !== null) {
                            label += (context.parsed.y / 1000000).toFixed(2) + ' M';
                          }
                          return label;
                        }
                      }
                    },
                  },
                }} 
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Circulation Details</CardTitle>
          <CardDescription>MILTON token circulation over time</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base sm:text-lg">Year</TableHead>
                <TableHead className="text-base sm:text-lg">Circulating Supply</TableHead>
                <TableHead className="text-base sm:text-lg">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.labels.map((year, index) => (
                <TableRow key={year}>
                  <TableCell className="text-sm sm:text-base">{year}</TableCell>
                  <TableCell className="text-sm sm:text-base font-medium">{(data.datasets[0].data[index] / 1000000).toFixed(2) + ' M'}</TableCell>
                  <TableCell className="text-sm sm:text-base">
                    {((data.datasets[0].data[index] / 18446000000) * 100).toFixed(2)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}