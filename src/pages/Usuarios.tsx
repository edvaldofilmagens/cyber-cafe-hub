import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Shield, ShieldCheck, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/contexts/AuthContext";
import { api } from "@/services/api";

interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

const Usuarios = () => {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "funcionario" as UserRole });
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar os usuários", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", role: "funcionario" });
    setEditId(null);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast({ title: "Erro", description: "Nome e email são obrigatórios", variant: "destructive" });
      return;
    }

    try {
      if (editId) {
        await api.updateUser(editId, { name: form.name, email: form.email, role: form.role });
        toast({ title: "Usuário atualizado" });
      } else {
        if (!form.password) {
          toast({ title: "Erro", description: "Senha é obrigatória para novo usuário", variant: "destructive" });
          return;
        }
        await api.createUser({ name: form.name, email: form.email, password: form.password, role: form.role });
        toast({ title: "Usuário criado com sucesso" });
      }
      await fetchUsers();
      setDialogOpen(false);
      resetForm();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Falha ao salvar", variant: "destructive" });
    }
  };

  const handleEdit = (user: ApiUser) => {
    setForm({ name: user.name, email: user.email, password: "", role: user.role as UserRole });
    setEditId(user.id);
    setDialogOpen(true);
  };

  const handleToggleActive = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    try {
      await api.updateUser(id, { active: !user.active });
      await fetchUsers();
      toast({ title: "Status atualizado" });
    } catch {
      toast({ title: "Erro", description: "Falha ao atualizar status", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Usuários</h1>
          <p className="text-sm text-muted-foreground">Gerenciar acessos ao sistema</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
              </div>
              {!editId && (
                <div className="space-y-2">
                  <Label>Senha</Label>
                  <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Senha de acesso" />
                </div>
              )}
              <div className="space-y-2">
                <Label>Nível de Acesso</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Administrador — Acesso total
                      </div>
                    </SelectItem>
                    <SelectItem value="funcionario">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Funcionário — PDV, Mesas e Computadores
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleSave}>
                {editId ? "Salvar Alterações" : "Criar Usuário"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Administrador</p>
              <p className="text-xs text-muted-foreground">
                Dashboard, PDV, Mesas, Computadores, Estoque, Financeiro, Vouchers, Usuários
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <Shield className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="font-medium">Funcionário</p>
              <p className="text-xs text-muted-foreground">
                PDV, Mesas e Computadores apenas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Usuários Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? "Admin" : "Funcionário"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.active ? "default" : "destructive"} className={user.active ? "bg-accent text-accent-foreground" : ""}>
                      {user.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleActive(user.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Usuarios;
