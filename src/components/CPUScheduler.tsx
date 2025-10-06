import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, SkipForward, Plus, Trash2 } from 'lucide-react';

interface Process {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  completionTime?: number;
  turnaroundTime?: number;
  waitingTime?: number;
}

interface GanttBlock {
  process: string;
  startTime: number;
  endTime: number;
  color: string;
}

const defaultProcesses: Process[] = [
  { id: 'p1', name: 'P1', arrivalTime: 0, burstTime: 6 },
  { id: 'p2', name: 'P2', arrivalTime: 2, burstTime: 4 },
  { id: 'p3', name: 'P3', arrivalTime: 4, burstTime: 2 },
  { id: 'p4', name: 'P4', arrivalTime: 5, burstTime: 3 },
];

const processColors = {
  P1: 'bg-process-p1',
  P2: 'bg-process-p2', 
  P3: 'bg-process-p3',
  P4: 'bg-process-p4',
};

const steps = [
  {
    title: "SJF Non-Preemptive Scheduling - Problem 60",
    description: "We'll solve this step by step using the Gantt chart method.",
    currentTime: 0,
    ganttBlocks: [],
    availableProcesses: [],
    runningProcess: null,
    showResults: false
  },
  {
    title: "Initial State - Time 0",
    description: "At time 0, only P1 has arrived. CPU starts executing P1.",
    currentTime: 0,
    ganttBlocks: [{ process: 'P1', startTime: 0, endTime: 6, color: 'bg-process-p1' }],
    availableProcesses: ['P1'],
    runningProcess: 'P1',
    showResults: false
  },
  {
    title: "Time 6 - P1 Complete",
    description: "At time 6, P2, P3, and P4 have arrived. P3 has shortest burst time (2).",
    currentTime: 6,
    ganttBlocks: [
      { process: 'P1', startTime: 0, endTime: 6, color: 'bg-process-p1' },
      { process: 'P3', startTime: 6, endTime: 8, color: 'bg-process-p3' }
    ],
    availableProcesses: ['P2 (4)', 'P3 (2)', 'P4 (3)'],
    runningProcess: 'P3',
    showResults: false
  },
  {
    title: "Time 8 - P3 Complete", 
    description: "At time 8, between P2 and P4, P4 has shorter burst time (3).",
    currentTime: 8,
    ganttBlocks: [
      { process: 'P1', startTime: 0, endTime: 6, color: 'bg-process-p1' },
      { process: 'P3', startTime: 6, endTime: 8, color: 'bg-process-p3' },
      { process: 'P4', startTime: 8, endTime: 11, color: 'bg-process-p4' }
    ],
    availableProcesses: ['P2 (4)', 'P4 (3)'],
    runningProcess: 'P4',
    showResults: false
  },
  {
    title: "Time 11 - P4 Complete",
    description: "At time 11, only P2 remains. P2 runs until completion.",
    currentTime: 11,
    ganttBlocks: [
      { process: 'P1', startTime: 0, endTime: 6, color: 'bg-process-p1' },
      { process: 'P3', startTime: 6, endTime: 8, color: 'bg-process-p3' },
      { process: 'P4', startTime: 8, endTime: 11, color: 'bg-process-p4' },
      { process: 'P2', startTime: 11, endTime: 15, color: 'bg-process-p2' }
    ],
    availableProcesses: ['P2 (4)'],
    runningProcess: 'P2',
    showResults: false
  },
  {
    title: "Final Results",
    description: "Scheduling complete. Average WT: 3.5 units, Average TAT: 7.25 units",
    currentTime: 15,
    ganttBlocks: [
      { process: 'P1', startTime: 0, endTime: 6, color: 'bg-process-p1' },
      { process: 'P3', startTime: 6, endTime: 8, color: 'bg-process-p3' },
      { process: 'P4', startTime: 8, endTime: 11, color: 'bg-process-p4' },
      { process: 'P2', startTime: 11, endTime: 15, color: 'bg-process-p2' }
    ],
    availableProcesses: [],
    runningProcess: null,
    showResults: true
  }
];

export default function CPUScheduler() {
  const [processes, setProcesses] = useState<Process[]>(defaultProcesses);
  const [showInputForm, setShowInputForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processResults, setProcessResults] = useState<Process[]>([]);

  useEffect(() => {
    // Calculate results
    const results = processes.map(process => {
      const ganttBlock = steps[5].ganttBlocks.find(block => block.process === process.name);
      if (ganttBlock) {
        const completionTime = ganttBlock.endTime;
        const turnaroundTime = completionTime - process.arrivalTime;
        const waitingTime = turnaroundTime - process.burstTime;
        return {
          ...process,
          completionTime,
          turnaroundTime,
          waitingTime
        };
      }
      return process;
    });
    setProcessResults(results);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep]);

  const handlePlay = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleAddProcess = () => {
    const newId = `p${processes.length + 1}`;
    const newName = `P${processes.length + 1}`;
    setProcesses([...processes, { id: newId, name: newName, arrivalTime: 0, burstTime: 1 }]);
  };

  const handleRemoveProcess = (id: string) => {
    if (processes.length > 1) {
      setProcesses(processes.filter(p => p.id !== id));
    }
  };

  const handleProcessChange = (id: string, field: 'arrivalTime' | 'burstTime', value: string) => {
    const numValue = parseInt(value) || 0;
    setProcesses(processes.map(p => 
      p.id === id ? { ...p, [field]: numValue } : p
    ));
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-t-lg">
            <CardTitle className="text-2xl font-bold">
              {currentStepData.title}
            </CardTitle>
            <p className="text-primary-foreground/90">
              {currentStepData.description}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {/* Controls */}
            <div className="flex justify-center space-x-4 mb-6 flex-wrap gap-2">
              <Button onClick={handlePlay} variant="default" size="lg">
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button onClick={handleNext} variant="outline" size="lg" disabled={currentStep >= steps.length - 1}>
                <SkipForward className="w-4 h-4 mr-2" />
                Next Step
              </Button>
              <Button onClick={handleReset} variant="secondary" size="lg">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={() => setShowInputForm(!showInputForm)} variant="outline" size="lg">
                {showInputForm ? 'Hide' : 'Edit'} Processes
              </Button>
            </div>

            {/* Step Progress */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index <= currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Process Input Form */}
        {showInputForm && (
          <Card className="shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle>Edit Process Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {processes.map((process, index) => (
                <div key={process.id} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end p-4 border rounded-lg">
                  <div>
                    <Label htmlFor={`process-${process.id}-name`}>Process Name</Label>
                    <Input
                      id={`process-${process.id}-name`}
                      value={process.name}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`process-${process.id}-at`}>Arrival Time (AT)</Label>
                    <Input
                      id={`process-${process.id}-at`}
                      type="number"
                      min="0"
                      value={process.arrivalTime}
                      onChange={(e) => handleProcessChange(process.id, 'arrivalTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`process-${process.id}-bt`}>Burst Time (BT)</Label>
                    <Input
                      id={`process-${process.id}-bt`}
                      type="number"
                      min="1"
                      value={process.burstTime}
                      onChange={(e) => handleProcessChange(process.id, 'burstTime', e.target.value)}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveProcess(process.id)}
                    disabled={processes.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={handleAddProcess} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Process
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Process Table */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                Process Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Process</th>
                      <th className="px-4 py-3 text-left font-semibold">AT</th>
                      <th className="px-4 py-3 text-left font-semibold">BT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processes.map((process) => (
                      <tr key={process.id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded ${processColors[process.name as keyof typeof processColors]}`} />
                            <span className="font-medium">{process.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{process.arrivalTime}</td>
                        <td className="px-4 py-3">{process.burstTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Available Processes */}
              {currentStepData.availableProcesses.length > 0 && (
                <div className="mt-4 p-4 bg-accent/10 rounded-lg">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                    Available Processes:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentStepData.availableProcesses.map((process, index) => (
                      <div
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          process.includes('(2)') ? 'bg-success text-success-foreground animate-pulse-soft' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {process}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CPU Visualization */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>CPU Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg mb-4">
                <span className="text-2xl font-bold text-primary-foreground">CPU</span>
              </div>
              {currentStepData.runningProcess ? (
                <div className="text-center animate-fade-in">
                  <p className="text-sm text-muted-foreground mb-2">Currently Running:</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 rounded ${processColors[currentStepData.runningProcess as keyof typeof processColors]} animate-process-enter`} />
                    <span className="text-xl font-bold">{currentStepData.runningProcess}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">CPU Idle</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gantt Chart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Gantt Chart Timeline</CardTitle>
            <p className="text-sm text-muted-foreground">
              Shows the execution order and timing of processes
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative bg-muted/30 p-4 rounded-lg">
              {/* Time Scale Header */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2">Time Units (0 to 15)</h4>
                <div className="relative h-8 bg-background border rounded">
                  {/* Time Grid Lines */}
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(time => (
                    <div
                      key={time}
                      className="absolute top-0 bottom-0 border-l border-muted"
                      style={{ left: `${(time / 15) * 100}%` }}
                    />
                  ))}
                  
                  {/* Time Labels */}
                  <div className="flex justify-between items-center h-full px-1 text-xs font-medium">
                    {[0, 3, 6, 9, 12, 15].map(time => (
                      <span key={time} className="text-muted-foreground">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Process Execution Blocks */}
              <div className="relative">
                <div className="flex h-20 border-2 border-primary/20 rounded-lg overflow-hidden bg-background shadow-inner">
                  {currentStepData.ganttBlocks.map((block, index) => {
                    const width = ((block.endTime - block.startTime) / 15) * 100;
                    return (
                      <div
                        key={index}
                        className={`${block.color} relative flex flex-col items-center justify-center text-white font-bold border-r border-white/20 animate-gantt-fill hover:brightness-110 transition-all`}
                        style={{ width: `${width}%` }}
                      >
                        <span className="text-lg">{block.process}</span>
                        <span className="text-xs opacity-90">
                          {block.startTime} → {block.endTime}
                        </span>
                        <span className="text-xs opacity-75">
                          ({block.endTime - block.startTime} units)
                        </span>
                      </div>
                    );
                  })}
                  
                  {/* Empty space for remaining time */}
                  {currentStepData.ganttBlocks.length > 0 && currentStepData.currentTime < 15 && (
                    <div 
                      className="bg-muted/50 flex items-center justify-center text-muted-foreground text-sm"
                      style={{ width: `${((15 - currentStepData.currentTime) / 15) * 100}%` }}
                    >
                      Waiting...
                    </div>
                  )}
                </div>
                
                {/* Detailed Time Markers */}
                <div className="flex justify-between mt-3 text-sm">
                  {[0, 2, 4, 5, 6, 8, 11, 15].map(time => (
                    <div key={time} className="text-center">
                      <div className={`w-0.5 h-4 mx-auto mb-1 ${
                        time <= currentStepData.currentTime ? 'bg-primary' : 'bg-muted'
                      }`} />
                      <span className={`text-xs ${
                        time <= currentStepData.currentTime ? 'font-semibold text-foreground' : 'text-muted-foreground'
                      }`}>
                        {time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-6 p-4 bg-background rounded-lg border">
                <h4 className="text-sm font-semibold mb-3">Process Legend</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {processes.map((process) => (
                    <div key={process.id} className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded ${processColors[process.name as keyof typeof processColors]}`} />
                      <span className="text-sm">
                        {process.name}: BT={process.burstTime}, AT={process.arrivalTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Status */}
              <div className="mt-4 p-3 bg-accent/10 rounded-lg border-l-4 border-accent">
                <p className="text-sm">
                  <span className="font-semibold">Current Time: {currentStepData.currentTime}</span>
                  {currentStepData.runningProcess && (
                    <span className="ml-4">
                      Running: <span className="font-semibold">{currentStepData.runningProcess}</span>
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        {currentStepData.showResults && (
          <Card className="shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle>Scheduling Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Process</th>
                      <th className="px-4 py-3 text-left font-semibold">CT</th>
                      <th className="px-4 py-3 text-left font-semibold">TAT</th>
                      <th className="px-4 py-3 text-left font-semibold">WT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processResults.map((process) => (
                      <tr key={process.id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded ${processColors[process.name as keyof typeof processColors]}`} />
                            <span className="font-medium">{process.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{process.completionTime}</td>
                        <td className="px-4 py-3">{process.turnaroundTime}</td>
                        <td className="px-4 py-3">{process.waitingTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 p-4 bg-success/10 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Waiting Time</p>
                    <p className="text-2xl font-bold text-success">3.5 units</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Average Turnaround Time</p>
                    <p className="text-2xl font-bold text-success">7.25 units</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}