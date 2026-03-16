import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Monitor, Play, Square, Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Computer {
  id: number;
  name: string;
  status: "livre" | "em_uso" | "manutencao";
  user: string | null;
  timeUsed: number;
  timeTotal: number;
  startedAt: string | null;
}

const initialComputers: Computer[] = [
  { id: 1, name: "PC-01", status: "em_uso", user: "João Silva", timeUsed: 45, timeTotal: 120, startedAt: "14:00" },
  { id: 2, name: "PC-02", status: "livre", user: null, timeUsed: 0, timeTotal: 0, startedAt: null },
];

const timeOptions = [
  { label: "30 min", value: 30 },
  { label: "1 hora", value: 60 },
  { label: "2 horas", value: 120 },
  { label: "5 horas", value: 300 },
];

const Computadores = () => {
  const [computers, setComputers] = useState<Computer[]>(initialComputers);
  const [selectedPc, setSelectedPc] = useState<number | null>(null);
  const [userName, setUserName] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const { toast } = useToast();

  const startSession = () => {
    if (!selectedPc || !userName || !selectedTime) return;
    const mins = parseInt(selectedTime);
    setComputers((prev) =>
      prev.map((pc) =>
        pc.id === selectedPc
          ? {
              ...pc,
              status: "em_uso" as const,
              user: userName,
              timeUsed: 0,
              timeTotal: mins,
              startedAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            }
          : pc
      )
    );
    toast({ title: "Sessão iniciada", description: `${userName} no PC-0${selectedPc} por ${mins}min` });
    setUserName("");
    setSelectedTime("");
    setSelectedPc(null);
  };

  const endSession = (id: number) => {
    setComputers((prev) =>
      prev.map((pc) =>
        pc.id === id
          ? { ...pc, status: "livre" as const, user: null, timeUsed: 0, timeTotal: 0, startedAt: null }
          : pc
      )
    );
    toast({ title: "Sessão encerrada", description: `PC-0${id} liberado` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Computadores</h1>
          <p className="text-sm text-muted-foreground">Gerencie o tempo de uso dos PCs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {computers.map((pc) => (
          <Card key={pc.id} className={pc.status === "em_uso" ? "border-primary/30" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      pc.status === "em_uso"
                        ? "bg-primary/10"
                        : pc.status === "livre"
                        ? "bg-success/10"
                        : "bg-warning/10"
                    }`}
                  >
                    <Monitor
                      className={`h-6 w-6 ${
                        pc.status === "em_uso"
                          ? "text-primary"
                          : pc.status === "livre"
                          ? "text-success"
                          : "text-warning"
                      }`}
                    />
                  </div>
                  <span className="font-heading text-xl">{pc.name}</span>
                </div>
                <Badge
                  className={
                    pc.status === "livre"
                      ? "bg-success text-success-foreground"
                      : pc.status === "manutencao"
                      ? "bg-warning text-warning-foreground"
                      : ""
                  }
                >
                  {pc.status === "em_uso" ? "Em uso" : pc.status === "livre" ? "Livre" : "Manutenção"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pc.status === "em_uso" && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{pc.user}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Início: {pc.startedAt} — {pc.timeUsed}min / {pc.timeTotal}min</span>
                    </div>
                  </div>
                  <Progress value={(pc.timeUsed / pc.timeTotal) * 100} className="h-2" />
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => endSession(pc.id)}
                  >
                    <Square className="mr-2 h-4 w-4" />
                    Encerrar Sessão
                  </Button>
                </>
              )}
              {pc.status === "livre" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full" onClick={() => setSelectedPc(pc.id)}>
                      <Play className="mr-2 h-4 w-4" />
                      Iniciar Sessão
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Iniciar Sessão — {pc.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nome do Cliente</Label>
                        <Input
                          placeholder="Nome do cliente"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tempo</Label>
                        <Select value={selectedTime} onValueChange={setSelectedTime}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tempo" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((t) => (
                              <SelectItem key={t.value} value={t.value.toString()}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full" onClick={startSession}>
                        Confirmar
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Computadores;
