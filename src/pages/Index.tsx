import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  deadline: Date | null;
  assignee: string;
  completed: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  color: string;
}

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Подготовить презентацию для клиента",
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      assignee: "Анна Петрова",
      completed: false,
    },
    {
      id: "2",
      title: "Провести код-ревью PR #234",
      deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000),
      assignee: "Иван Сидоров",
      completed: false,
    },
    {
      id: "3",
      title: "Обновить документацию API",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assignee: "Мария Иванова",
      completed: false,
    },
  ]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: "1", name: "Анна Петрова", color: "#2563EB" },
    { id: "2", name: "Иван Сидоров", color: "#1E4798" },
    { id: "3", name: "Мария Иванова", color: "#64748B" },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const [newMemberName, setNewMemberName] = useState("");
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const calculateTimeLeft = (deadline: Date | null) => {
    if (!deadline) return null;

    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const difference = deadlineTime - now;

    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, expired: false };
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) {
      toast.error("Введите название задачи");
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      deadline: newTaskDeadline ? new Date(newTaskDeadline) : null,
      assignee: newTaskAssignee || "Не назначено",
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    setNewTaskDeadline("");
    setNewTaskAssignee("");
    setIsAddTaskOpen(false);
    toast.success("Задача добавлена");
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    toast.success("Задача удалена");
  };

  const addTeamMember = () => {
    if (!newMemberName.trim()) {
      toast.error("Введите имя участника");
      return;
    }

    const colors = ["#2563EB", "#1E4798", "#64748B", "#8B5CF6", "#0EA5E9"];
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: newMemberName,
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setTeamMembers([...teamMembers, newMember]);
    setNewMemberName("");
    setIsAddMemberOpen(false);
    toast.success("Участник добавлен");
  };

  const removeMember = (id: string) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== id));
    toast.success("Участник удален");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Планировщик задач</h1>
          <p className="text-muted-foreground">Командная работа с максимальной эффективностью</p>
        </div>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="tasks" className="text-base">
              <Icon name="CheckSquare" className="w-4 h-4 mr-2" />
              Задачи
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-base">
              <Icon name="Settings" className="w-4 h-4 mr-2" />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Icon name="ListTodo" className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-semibold">Активные задачи</h2>
              </div>
              <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Icon name="Plus" className="w-4 h-4" />
                    Добавить задачу
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Новая задача</DialogTitle>
                    <DialogDescription>Создайте задачу и назначьте исполнителя</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Название задачи</Label>
                      <Input
                        id="title"
                        placeholder="Введите название..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Дедлайн</Label>
                      <Input
                        id="deadline"
                        type="datetime-local"
                        value={newTaskDeadline}
                        onChange={(e) => setNewTaskDeadline(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assignee">Исполнитель</Label>
                      <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите исполнителя" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.name}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={addTask} className="w-full">
                      Создать задачу
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {tasks.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Icon name="Inbox" className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Нет активных задач</p>
                  </CardContent>
                </Card>
              ) : (
                tasks.map((task) => {
                  const timeLeft = calculateTimeLeft(task.deadline);
                  const member = teamMembers.find((m) => m.name === task.assignee);

                  return (
                    <Card
                      key={task.id}
                      className={`transition-all hover:shadow-md ${
                        task.completed ? "opacity-60 border-muted" : "border-border"
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <button
                              onClick={() => toggleTaskComplete(task.id)}
                              className="mt-1 flex-shrink-0"
                            >
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  task.completed
                                    ? "bg-primary border-primary"
                                    : "border-muted-foreground hover:border-primary"
                                }`}
                              >
                                {task.completed && <Icon name="Check" className="w-3 h-3 text-white" />}
                              </div>
                            </button>
                            <div className="flex-1">
                              <CardTitle
                                className={`text-lg ${task.completed ? "line-through text-muted-foreground" : ""}`}
                              >
                                {task.title}
                              </CardTitle>
                              {timeLeft && (
                                <CardDescription className="mt-2 flex items-center gap-2">
                                  <Icon
                                    name="Clock"
                                    className={`w-4 h-4 ${
                                      timeLeft.expired
                                        ? "text-destructive"
                                        : timeLeft.days === 0
                                        ? "text-orange-500"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                  {timeLeft.expired ? (
                                    <span className="text-destructive font-medium">Просрочено</span>
                                  ) : (
                                    <span
                                      className={
                                        timeLeft.days === 0
                                          ? "text-orange-500 font-medium"
                                          : "text-muted-foreground"
                                      }
                                    >
                                      {timeLeft.days > 0 && `${timeLeft.days} д. `}
                                      {timeLeft.hours} ч. {timeLeft.minutes} мин.
                                    </span>
                                  )}
                                </CardDescription>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTask(task.id)}
                            className="ml-2 flex-shrink-0"
                          >
                            <Icon name="Trash2" className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8" style={{ backgroundColor: member?.color || "#64748B" }}>
                            <AvatarFallback className="text-white text-xs font-medium">
                              {task.assignee
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{task.assignee}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Users" className="w-5 h-5" />
                      Команда
                    </CardTitle>
                    <CardDescription className="mt-1">Управление участниками проекта</CardDescription>
                  </div>
                  <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Icon name="UserPlus" className="w-4 h-4" />
                        Добавить участника
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Новый участник</DialogTitle>
                        <DialogDescription>Добавьте участника в команду</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="memberName">Имя участника</Label>
                          <Input
                            id="memberName"
                            placeholder="Введите имя..."
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                          />
                        </div>
                        <Button onClick={addTeamMember} className="w-full">
                          Добавить
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10" style={{ backgroundColor: member.color }}>
                          <AvatarFallback className="text-white font-medium">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{member.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeMember(member.id)}>
                        <Icon name="Trash2" className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Smartphone" className="w-5 h-5" />
                  Мобильный виджет
                </CardTitle>
                <CardDescription className="mt-1">
                  Добавьте виджет на главный экран для быстрого доступа к задачам с дедлайнами
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-start gap-3 mb-3">
                      <Icon name="Info" className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">Как добавить виджет:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Откройте это приложение в браузере телефона</li>
                          <li>Нажмите "Поделиться" или меню браузера</li>
                          <li>Выберите "Добавить на главный экран"</li>
                          <li>Виджет будет показывать задачи с ближайшими дедлайнами</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full gap-2">
                    <Icon name="Download" className="w-4 h-4" />
                    Инструкция по установке
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
