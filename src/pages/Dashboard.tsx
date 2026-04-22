import React, { useState, useMemo } from "react";
import { useTaskContext } from "@/contexts/TaskContext";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import { TaskList } from "@/components/TaskList";
import { TaskForm } from "@/components/TaskForm";
import { TaskStats } from "@/components/TaskStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task } from "@/types/task";
import { PatientTaskGrid, TaskTemplate, PatientInfo } from "@/components/PatientTaskGrid";
import { useIsMobile } from "@/hooks/use-mobile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchFilter } from "@/components/SearchFilter";
import taskrLogo from "@/assets/taskr-logo.png";

const WARDS = [
  { value: "cardiology-25", label: "Cardiology Ward 25" },
  { value: "endocrinology-18", label: "Endocrinology Ward 18" },
  { value: "amu", label: "AMU" },
];

const Dashboard: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | undefined>(undefined);
  const [prefilledPatient, setPrefilledPatient] = useState<PatientInfo | undefined>(undefined);
  const [prefilledTemplate, setPrefilledTemplate] = useState<TaskTemplate | undefined>(undefined);
  const [selectedWard, setSelectedWard] = useState<string>("cardiology-25");
  const [searchQuery, setSearchQuery] = useState("");
  const { tasks, getTasksByTag } = useTaskContext();
  const [activeTab, setActiveTab] = useState("all");
  const [isTabsOpen, setIsTabsOpen] = useState(false);
  const isMobile = useIsMobile();

  // Filter tasks based on search query
  const filterTasks = useMemo(() => {
    return (taskList: Task[]) => {
      if (!searchQuery.trim()) return taskList;
      const query = searchQuery.toLowerCase();
      return taskList.filter(task =>
        task.patientName.toLowerCase().includes(query) ||
        task.bedNumber.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query)) ||
        task.description.toLowerCase().includes(query)
      );
    };
  }, [searchQuery]);
  
  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setPrefilledPatient(undefined);
    setPrefilledTemplate(undefined);
    setIsFormOpen(true);
  };
  
  const handleAddNewTask = () => {
    setEditTask(undefined);
    setPrefilledPatient(undefined);
    setPrefilledTemplate(undefined);
    setIsFormOpen(true);
  };

  const handleAddTaskForPatient = (patientInfo: PatientInfo, template?: TaskTemplate) => {
    setEditTask(undefined);
    setPrefilledPatient(patientInfo);
    setPrefilledTemplate(template);
    setIsFormOpen(true);
  };

  const showPatientGrid = true; // You can toggle this based on a user setting if needed

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (isMobile) {
      setIsTabsOpen(false);
    }
  };

  const tabOptions = [
    { value: "all", label: "All" },
    { value: "practical", label: "Practical" },
    { value: "prescribing", label: "Prescribing" },
    { value: "referrals", label: "Referrals" },
    { value: "discharge", label: "Discharge Summaries" },
    { value: "completed", label: "Completed" },
  ];

  // Filter out completed tasks for main tabs and apply search filter
  const activeTasks = filterTasks(tasks.filter(t => t.status !== "complete"));
  const completedTasks = filterTasks(tasks.filter(t => t.status === "complete"));
  const getActiveTasksByTag = (tag: string) => filterTasks(getTasksByTag(tag as any).filter(t => t.status !== "complete"));

  return (
    <div className="container py-6 px-4 md:py-10 md:px-6 mx-auto max-w-5xl">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <img src={taskrLogo} alt="TASKR Logo" className="h-12 md:h-16 w-auto" />
          <div className="flex items-center gap-2">
            <Select value={selectedWard} onValueChange={setSelectedWard}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Select Ward" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {WARDS.map((ward) => (
                  <SelectItem key={ward.value} value={ward.value}>
                    {ward.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddNewTask} className="bg-medical-blue hover:bg-medical-dark-blue">
              <Plus className="mr-2 h-4 w-4" /> Add Patient
            </Button>
          </div>
        </div>
        <SearchFilter searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </div>
      
      <TaskStats />
      
      {isMobile ? (
        <div className="mt-6">
          <Collapsible open={isTabsOpen} onOpenChange={setIsTabsOpen} className="w-full">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {tabOptions.find(tab => tab.value === activeTab)?.label || "Select Category"}
                <ChevronDown className={`h-4 w-4 transition-transform ${isTabsOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 border rounded-lg overflow-hidden">
              <div className="flex flex-col">
                {tabOptions.map((tab) => (
                  <Button 
                    key={tab.value}
                    variant="ghost" 
                    className={`justify-start rounded-none ${activeTab === tab.value ? "bg-muted" : ""}`}
                    onClick={() => handleTabChange(tab.value)}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          <div className="mt-6">
            {tabOptions.map((tab) => (
              <div key={tab.value} className={activeTab === tab.value ? "block" : "hidden"}>
                {tab.value === "all" && (
                  <PatientTaskGrid 
                    tasks={activeTasks} 
                    onAddTaskForPatient={handleAddTaskForPatient} 
                    onEditTask={handleEditTask} 
                  />
                )}
                {tab.value === "practical" && (
                  <PatientTaskGrid 
                    tasks={getActiveTasksByTag("practical")} 
                    onAddTaskForPatient={handleAddTaskForPatient} 
                    onEditTask={handleEditTask} 
                  />
                )}
                {tab.value === "prescribing" && (
                  <PatientTaskGrid 
                    tasks={getActiveTasksByTag("prescribing")} 
                    onAddTaskForPatient={handleAddTaskForPatient} 
                    onEditTask={handleEditTask} 
                  />
                )}
                {tab.value === "referrals" && (
                  <PatientTaskGrid 
                    tasks={getActiveTasksByTag("referrals")} 
                    onAddTaskForPatient={handleAddTaskForPatient} 
                    onEditTask={handleEditTask} 
                  />
                )}
                {tab.value === "discharge" && (
                  <PatientTaskGrid 
                    tasks={getActiveTasksByTag("discharge")} 
                    onAddTaskForPatient={handleAddTaskForPatient} 
                    onEditTask={handleEditTask} 
                  />
                )}
                {tab.value === "completed" && (
                  <PatientTaskGrid 
                    tasks={completedTasks} 
                    onAddTaskForPatient={handleAddTaskForPatient} 
                    onEditTask={handleEditTask} 
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full mt-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="practical">Practical</TabsTrigger>
            <TabsTrigger value="prescribing">Prescribing</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="discharge">Discharge</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            {showPatientGrid ? (
              <PatientTaskGrid 
                tasks={activeTasks} 
                onAddTaskForPatient={handleAddTaskForPatient} 
                onEditTask={handleEditTask} 
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <TaskList status="pending" onEditTask={handleEditTask} />
                </div>
                <div>
                  <TaskList status="progress" onEditTask={handleEditTask} />
                </div>
                <div>
                  <TaskList status="complete" onEditTask={handleEditTask} />
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="practical" className="mt-6">
            {showPatientGrid ? (
              <PatientTaskGrid 
                tasks={getActiveTasksByTag("practical")} 
                onAddTaskForPatient={handleAddTaskForPatient} 
                onEditTask={handleEditTask} 
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {getActiveTasksByTag("practical").length > 0 ? (
                  <>
                    <div>
                      <TaskList status="pending" tag="practical" onEditTask={handleEditTask} />
                    </div>
                    <div>
                      <TaskList status="progress" tag="practical" onEditTask={handleEditTask} />
                    </div>
                  </>
                ) : (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-muted-foreground">No practical tasks found</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="prescribing" className="mt-6">
            {showPatientGrid ? (
              <PatientTaskGrid 
                tasks={getActiveTasksByTag("prescribing")} 
                onAddTaskForPatient={handleAddTaskForPatient} 
                onEditTask={handleEditTask} 
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {getActiveTasksByTag("prescribing").length > 0 ? (
                  <>
                    <div>
                      <TaskList status="pending" tag="prescribing" onEditTask={handleEditTask} />
                    </div>
                    <div>
                      <TaskList status="progress" tag="prescribing" onEditTask={handleEditTask} />
                    </div>
                  </>
                ) : (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-muted-foreground">No prescribing tasks found</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="referrals" className="mt-6">
            {showPatientGrid ? (
              <PatientTaskGrid 
                tasks={getActiveTasksByTag("referrals")} 
                onAddTaskForPatient={handleAddTaskForPatient} 
                onEditTask={handleEditTask} 
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {getActiveTasksByTag("referrals").length > 0 ? (
                  <>
                    <div>
                      <TaskList status="pending" tag="referrals" onEditTask={handleEditTask} />
                    </div>
                    <div>
                      <TaskList status="progress" tag="referrals" onEditTask={handleEditTask} />
                    </div>
                  </>
                ) : (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-muted-foreground">No referrals tasks found</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="discharge" className="mt-6">
            {showPatientGrid ? (
              <PatientTaskGrid 
                tasks={getActiveTasksByTag("discharge")} 
                onAddTaskForPatient={handleAddTaskForPatient} 
                onEditTask={handleEditTask} 
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {getActiveTasksByTag("discharge").length > 0 ? (
                  <>
                    <div>
                      <TaskList status="pending" tag="discharge" onEditTask={handleEditTask} />
                    </div>
                    <div>
                      <TaskList status="progress" tag="discharge" onEditTask={handleEditTask} />
                    </div>
                  </>
                ) : (
                  <div className="col-span-3 text-center py-8">
                    <p className="text-muted-foreground">No discharge summary tasks found</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedTasks.length > 0 ? (
              <PatientTaskGrid 
                tasks={completedTasks} 
                onAddTaskForPatient={handleAddTaskForPatient} 
                onEditTask={handleEditTask} 
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No completed tasks yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Demo notice: all patient names, identifiers, and task data shown in TASKR are fictional.
      </p>
      
      <TaskForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        editTask={editTask}
        prefilledPatient={prefilledPatient}
        prefilledTemplate={prefilledTemplate}
      />
    </div>
  );
};

export default Dashboard;
