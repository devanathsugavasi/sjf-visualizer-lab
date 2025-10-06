import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Clock, Cpu, Plus, Trash2, Edit } from 'lucide-react';

interface Process {
  name: string;
  arrivalTime: number;
  burstTime: number;
  completionTime?: number;
  turnaroundTime?: number;
  waitingTime?: number;
  color: string;
}

const defaultProcesses: Process[] = [
  { name: 'P1', arrivalTime: 0, burstTime: 6, color: 'bg-blue-500' },
  { name: 'P2', arrivalTime: 2, burstTime: 4, color: 'bg-red-500' },
  { name: 'P3', arrivalTime: 4, burstTime: 2, color: 'bg-orange-500' },
  { name: 'P4', arrivalTime: 5, burstTime: 3, color: 'bg-purple-500' },
];

const processColors = ['bg-blue-500', 'bg-red-500', 'bg-orange-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500'];

interface AnimationStep {
  time: number;
  title: string;
  description: string;
  arrivedProcesses: string[];
  readyQueue: Process[];
  runningProcess: Process | null;
  ganttBlocks: { process: string; start: number; end: number; color: string }[];
  showDecision: boolean;
  highlightShortest?: string;
}

const animationSteps: AnimationStep[] = [
  {
    time: 0,
    title: "Time 0: Start",
    description: "Only P1 has arrived. CPU starts executing P1.",
    arrivedProcesses: ['P1'],
    readyQueue: [defaultProcesses[0]],
    runningProcess: defaultProcesses[0],
    ganttBlocks: [],
    showDecision: false
  },
  {
    time: 2,
    title: "Time 2: P2 Arrives",
    description: "P2 arrives but P1 is still running (non-preemptive).",
    arrivedProcesses: ['P1', 'P2'],
    readyQueue: [defaultProcesses[1]],
    runningProcess: defaultProcesses[0],
    ganttBlocks: [],
    showDecision: false
  },
  {
    time: 4,
    title: "Time 4: P3 Arrives",
    description: "P3 arrives. P1 still running.",
    arrivedProcesses: ['P1', 'P2', 'P3'],
    readyQueue: [defaultProcesses[1], defaultProcesses[2]],
    runningProcess: defaultProcesses[0],
    ganttBlocks: [],
    showDecision: false
  },
  {
    time: 5,
    title: "Time 5: P4 Arrives",
    description: "P4 arrives. All processes are now in the system.",
    arrivedProcesses: ['P1', 'P2', 'P3', 'P4'],
    readyQueue: [defaultProcesses[1], defaultProcesses[2], defaultProcesses[3]],
    runningProcess: defaultProcesses[0],
    ganttBlocks: [],
    showDecision: false
  },
  {
    time: 6,
    title: "Time 6: P1 Complete - Decision Time!",
    description: "P1 finishes. Choose shortest job: P3 (BT=2) vs P2 (BT=4) vs P4 (BT=3)",
    arrivedProcesses: ['P2', 'P3', 'P4'],
    readyQueue: [defaultProcesses[1], defaultProcesses[2], defaultProcesses[3]],
    runningProcess: null,
    ganttBlocks: [{ process: 'P1', start: 0, end: 6, color: 'bg-blue-500' }],
    showDecision: true,
    highlightShortest: 'P3'
  },
  {
    time: 6,
    title: "Time 6: P3 Selected",
    description: "P3 selected (shortest burst time = 2). P3 runs from 6 to 8.",
    arrivedProcesses: ['P2', 'P4'],
    readyQueue: [defaultProcesses[1], defaultProcesses[3]],
    runningProcess: defaultProcesses[2],
    ganttBlocks: [
      { process: 'P1', start: 0, end: 6, color: 'bg-blue-500' },
      { process: 'P3', start: 6, end: 8, color: 'bg-orange-500' }
    ],
    showDecision: false
  },
  {
    time: 8,
    title: "Time 8: P3 Complete - Decision Time!",
    description: "P3 finishes. Choose between P2 (BT=4) and P4 (BT=3)",
    arrivedProcesses: ['P2', 'P4'],
    readyQueue: [defaultProcesses[1], defaultProcesses[3]],
    runningProcess: null,
    ganttBlocks: [
      { process: 'P1', start: 0, end: 6, color: 'bg-blue-500' },
      { process: 'P3', start: 6, end: 8, color: 'bg-orange-500' }
    ],
    showDecision: true,
    highlightShortest: 'P4'
  },
  {
    time: 8,
    title: "Time 8: P4 Selected",
    description: "P4 selected (BT=3 < BT=4). P4 runs from 8 to 11.",
    arrivedProcesses: ['P2'],
    readyQueue: [defaultProcesses[1]],
    runningProcess: defaultProcesses[3],
    ganttBlocks: [
      { process: 'P1', start: 0, end: 6, color: 'bg-blue-500' },
      { process: 'P3', start: 6, end: 8, color: 'bg-orange-500' },
      { process: 'P4', start: 8, end: 11, color: 'bg-purple-500' }
    ],
    showDecision: false
  },
  {
    time: 11,
    title: "Time 11: P4 Complete",
    description: "P4 finishes. Only P2 remains. P2 runs from 11 to 15.",
    arrivedProcesses: ['P2'],
    readyQueue: [defaultProcesses[1]],
    runningProcess: defaultProcesses[1],
    ganttBlocks: [
      { process: 'P1', start: 0, end: 6, color: 'bg-blue-500' },
      { process: 'P3', start: 6, end: 8, color: 'bg-orange-500' },
      { process: 'P4', start: 8, end: 11, color: 'bg-purple-500' },
      { process: 'P2', start: 11, end: 15, color: 'bg-red-500' }
    ],
    showDecision: false
  },
  {
    time: 15,
    title: "Time 15: All Complete!",
    description: "All processes finished. Scheduling complete!",
    arrivedProcesses: [],
    readyQueue: [],
    runningProcess: null,
    ganttBlocks: [
      { process: 'P1', start: 0, end: 6, color: 'bg-blue-500' },
      { process: 'P3', start: 6, end: 8, color: 'bg-orange-500' },
      { process: 'P4', start: 8, end: 11, color: 'bg-purple-500' },
      { process: 'P2', start: 11, end: 15, color: 'bg-red-500' }
    ],
    showDecision: false
  }
];

export default function SJFAnimation() {
  const [processes, setProcesses] = useState<Process[]>(defaultProcesses);
  const [showInputForm, setShowInputForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const currentStepData = animationSteps[currentStep];

  // Calculate results
  const results = [
    { name: 'P1', ct: 6, tat: 6, wt: 0 },
    { name: 'P3', ct: 8, tat: 4, wt: 2 },
    { name: 'P4', ct: 11, tat: 6, wt: 3 },
    { name: 'P2', ct: 15, tat: 13, wt: 9 }
  ];

  const avgWT = results.reduce((sum, p) => sum + p.wt, 0) / results.length;
  const avgTAT = results.reduce((sum, p) => sum + p.tat, 0) / results.length;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < animationSteps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= animationSteps.length - 1) {
            setIsPlaying(false);
            setShowResults(true);
            return prev;
          }
          return prev + 1;
        });
      }, 2500);
    } else if (currentStep >= animationSteps.length - 1) {
      setShowResults(true);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep]);

  const handlePlay = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setShowResults(false);
  };
  const handleNext = () => {
    if (currentStep < animationSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleAddProcess = () => {
    const newProcessNum = processes.length + 1;
    const colorIndex = (processes.length) % processColors.length;
    setProcesses([...processes, { 
      name: `P${newProcessNum}`, 
      arrivalTime: 0, 
      burstTime: 1,
      color: processColors[colorIndex]
    }]);
  };

  const handleRemoveProcess = (name: string) => {
    if (processes.length > 1) {
      setProcesses(processes.filter(p => p.name !== name));
    }
  };

  const handleProcessChange = (name: string, field: 'arrivalTime' | 'burstTime', value: string) => {
    const numValue = Math.max(field === 'burstTime' ? 1 : 0, parseInt(value) || 0);
    setProcesses(processes.map(p => 
      p.name === name ? { ...p, [field]: numValue } : p
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold text-center">
              SJF Non-Preemptive Scheduling
            </CardTitle>
            <p className="text-center text-blue-100 text-lg">
              Shortest Job First Algorithm Animation
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {/* Problem Statement */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-bold text-lg mb-2">Problem:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {processes.map(p => (
                  <div key={p.name} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded ${p.color}`} />
                    <span className="font-medium">{p.name}: AT={p.arrivalTime}, BT={p.burstTime}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center flex-wrap gap-3">
              <Button onClick={handlePlay} size="lg" className="bg-green-600 hover:bg-green-700">
                {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button onClick={handleNext} variant="outline" size="lg" disabled={currentStep >= animationSteps.length - 1}>
                Next Step
              </Button>
              <Button onClick={handleReset} variant="secondary" size="lg">
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
              <Button onClick={() => setShowInputForm(!showInputForm)} variant="outline" size="lg">
                <Edit className="w-5 h-5 mr-2" />
                {showInputForm ? 'Hide' : 'Edit'} Processes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Process Input Form */}
        {showInputForm && (
          <Card className="shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle>Edit Process Details</CardTitle>
              <p className="text-sm text-muted-foreground">Modify arrival time (AT) and burst time (BT) for each process</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {processes.map((process) => (
                <div key={process.name} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end p-4 border rounded-lg">
                  <div>
                    <Label htmlFor={`process-${process.name}-name`}>Process</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className={`w-6 h-6 rounded ${process.color}`} />
                      <span className="font-bold">{process.name}</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`process-${process.name}-at`}>Arrival Time (AT)</Label>
                    <Input
                      id={`process-${process.name}-at`}
                      type="number"
                      min="0"
                      value={process.arrivalTime}
                      onChange={(e) => handleProcessChange(process.name, 'arrivalTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`process-${process.name}-bt`}>Burst Time (BT)</Label>
                    <Input
                      id={`process-${process.name}-bt`}
                      type="number"
                      min="1"
                      value={process.burstTime}
                      onChange={(e) => handleProcessChange(process.name, 'burstTime', e.target.value)}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveProcess(process.name)}
                    disabled={processes.length === 1}
                    title="Remove process"
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

        {/* Main Animation */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Current State */}
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
              </div>
              <p className="text-muted-foreground">{currentStepData.description}</p>
            </CardHeader>
            <CardContent>
              
              {/* CPU and Process Visualization */}
              <div className="mb-6">
                <div className="flex justify-center items-center space-x-8 mb-4">
                  {/* CPU */}
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center shadow-lg mb-2">
                      <Cpu className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-sm font-medium">CPU</p>
                    {currentStepData.runningProcess && (
                      <div className="animate-bounce mt-2">
                        <div className={`w-8 h-8 ${currentStepData.runningProcess.color} rounded mx-auto flex items-center justify-center text-white font-bold text-sm`}>
                          {currentStepData.runningProcess.name}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  {currentStepData.runningProcess && (
                    <div className="text-2xl animate-pulse">→</div>
                  )}

                  {/* Running Process Details */}
                  {currentStepData.runningProcess && (
                    <div className="text-center">
                      <div className="p-4 bg-green-100 rounded-lg">
                        <p className="font-bold text-green-800">Currently Running</p>
                        <p className="text-sm text-green-600">
                          {currentStepData.runningProcess.name} (BT: {currentStepData.runningProcess.burstTime})
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Decision Making */}
                {currentStepData.showDecision && (
                  <div className="animate-fade-in p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300 mb-4">
                    <h4 className="font-bold text-yellow-800 mb-2">🤔 Decision Time!</h4>
                    <p className="text-sm text-yellow-700 mb-3">Available processes in ready queue:</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {currentStepData.readyQueue.map(process => (
                        <div 
                          key={process.name}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            process.name === currentStepData.highlightShortest 
                              ? 'bg-green-200 border-green-500 animate-pulse-soft' 
                              : 'bg-white border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 ${process.color} rounded`} />
                            <span className="font-bold">{process.name}</span>
                          </div>
                          <p className="text-xs mt-1">Burst Time: {process.burstTime}</p>
                          {process.name === currentStepData.highlightShortest && (
                            <p className="text-xs text-green-600 font-bold mt-1">✓ Shortest!</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Simple Gantt Chart */}
              <div className="mt-6">
                <h4 className="font-bold mb-3">Gantt Chart Progress:</h4>
                <div className="relative">
                  <div className="flex h-12 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                    {currentStepData.ganttBlocks.map((block, index) => {
                      const width = ((block.end - block.start) / 15) * 100;
                      return (
                        <div
                          key={index}
                          className={`${block.color} flex items-center justify-center text-white font-bold animate-slide-in`}
                          style={{ width: `${width}%` }}
                        >
                          {block.process}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                    <span>15</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ready Queue */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Ready Queue</CardTitle>
              <p className="text-sm text-muted-foreground">Processes waiting for CPU</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentStepData.readyQueue.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Queue Empty</p>
                ) : (
                  currentStepData.readyQueue.map((process, index) => (
                    <div 
                      key={process.name}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={`w-8 h-8 ${process.color} rounded flex items-center justify-center text-white font-bold text-sm`}>
                        {process.name}
                      </div>
                      <div>
                        <p className="font-medium">{process.name}</p>
                        <p className="text-xs text-gray-600">BT: {process.burstTime}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        {showResults && (
          <Card className="shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl text-center">📊 Final Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Process</th>
                      <th className="px-4 py-3 text-left">Completion Time</th>
                      <th className="px-4 py-3 text-left">Turnaround Time</th>
                      <th className="px-4 py-3 text-left">Waiting Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={result.name} className="border-t">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded ${defaultProcesses.find(p => p.name === result.name)?.color || 'bg-gray-500'}`} />
                            <span className="font-medium">{result.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{result.ct}</td>
                        <td className="px-4 py-3">{result.tat}</td>
                        <td className="px-4 py-3">{result.wt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-green-100 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">Average Waiting Time</p>
                  <p className="text-3xl font-bold text-green-800">{avgWT} units</p>
                </div>
                <div className="text-center p-4 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Average Turnaround Time</p>
                  <p className="text-3xl font-bold text-blue-800">{avgTAT} units</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}