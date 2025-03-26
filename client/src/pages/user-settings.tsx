import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { insertUserSchema } from "@shared/schema";
import { USER_ROLES } from "@/lib/constants";
import { z } from "zod";

// Extend the schema with validation
const userFormSchema = insertUserSchema.extend({
  username: z.string().min(3, { message: "Kullanıcı adı en az 3 karakter olmalıdır" }),
  password: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır" }),
  passwordConfirm: z.string(),
  name: z.string().min(2, { message: "Ad en az 2 karakter olmalıdır" }),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
  role: z.string(),
  isActive: z.boolean().default(true),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Şifreler eşleşmiyor",
  path: ["passwordConfirm"],
});

type UserFormValues = z.infer<typeof userFormSchema>;

const UserSettings = () => {
  const { toast } = useToast();
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      passwordConfirm: "",
      name: "",
      email: "",
      role: "user",
      isActive: true,
    },
  });

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: () => {
      // For demo purposes, we'll use mock data
      return Promise.resolve([
        {
          id: 1,
          username: "admin",
          password: "***********",
          name: "Sistem Yöneticisi",
          email: "admin@muhaseb.com",
          role: "admin",
          isActive: true
        },
        {
          id: 2,
          username: "muhasebeci",
          password: "***********",
          name: "Ahmet Yılmaz",
          email: "ahmet@muhaseb.com",
          role: "accountant",
          isActive: true
        },
        {
          id: 3,
          username: "kullanici",
          password: "***********",
          name: "Ayşe Demir",
          email: "ayse@muhaseb.com",
          role: "user",
          isActive: false
        }
      ]);
    }
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      // Remove passwordConfirm as it's not in the schema
      const { passwordConfirm, ...userData } = data;
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      
      toast({
        title: "Başarılı",
        description: "Kullanıcı başarıyla eklendi.",
      });
      
      setIsNewUserDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Kullanıcı eklenirken bir hata oluştu: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      // For demo, we'll just simulate success
      return Promise.resolve();
      // In a real app:
      // await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      
      toast({
        title: "Başarılı",
        description: "Kullanıcı başarıyla silindi.",
      });
      
      setIsDeleteAlertOpen(false);
      setUserToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: `Kullanıcı silinirken bir hata oluştu: ${(error as Error).message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserFormValues) => {
    createUserMutation.mutate(data);
  };

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (userToDelete !== null) {
      deleteUserMutation.mutate(userToDelete);
    }
  };

  const toggleUserStatus = (userId: number, currentStatus: boolean) => {
    // For demo, we just show a toast
    toast({
      title: "Durum Değiştirildi",
      description: `Kullanıcı durumu ${currentStatus ? 'pasif' : 'aktif'} olarak güncellendi.`,
    });
    
    // In a real app, you would make an API call:
    // apiRequest("PATCH", `/api/users/${userId}`, { isActive: !currentStatus })
    //   .then(() => queryClient.invalidateQueries({ queryKey: ['/api/users'] }));
  };

  // Filter users based on search term
  const filteredUsers = users 
    ? users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="text-lg">Kullanıcı Yönetimi</CardTitle>
          <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-user-plus mr-2"></i>
                Yeni Kullanıcı
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kullanıcı Adı *</FormLabel>
                          <FormControl>
                            <Input placeholder="Kullanıcı adı giriniz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad Soyad *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ad soyad giriniz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-posta *</FormLabel>
                          <FormControl>
                            <Input placeholder="E-posta giriniz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rol *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Rol seçiniz" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {USER_ROLES.map(role => (
                                <SelectItem key={role.value} value={role.value}>
                                  {role.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Şifre *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Şifre giriniz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="passwordConfirm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Şifre Tekrar *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Şifreyi tekrar giriniz" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Aktif Durum</FormLabel>
                          <FormMessage />
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsNewUserDialogOpen(false)}>
                      İptal
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createUserMutation.isPending}
                    >
                      {createUserMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Kaydediliyor...
                        </>
                      ) : "Kaydet"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center gap-4 p-4">
          <Input
            placeholder="Kullanıcı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              <i className="fas fa-sync-alt mr-2"></i>
              Sıfırla
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-neutral-200 rounded"></div>
              <div className="h-16 bg-neutral-200 rounded"></div>
              <div className="h-16 bg-neutral-200 rounded"></div>
              <div className="h-16 bg-neutral-200 rounded"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı Adı</TableHead>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-center">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 ${
                            user.role === 'admin' 
                              ? 'bg-primary bg-opacity-10 text-primary' 
                              : user.role === 'accountant'
                                ? 'bg-accent bg-opacity-10 text-accent'
                                : 'bg-neutral-200 text-neutral-600'
                          } text-xs rounded`}>
                            {USER_ROLES.find(r => r.value === user.role)?.label || user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={user.isActive}
                              onCheckedChange={() => toggleUserStatus(user.id, user.isActive)}
                            />
                            <Label>{user.isActive ? 'Aktif' : 'Pasif'}</Label>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-2">
                            <Button variant="ghost" size="icon">
                              <i className="fas fa-edit text-primary"></i>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteClick(user.id)}
                              disabled={user.username === 'admin'} // Prevent deleting admin
                            >
                              <i className="fas fa-trash-alt text-danger"></i>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Kullanıcı bulunamadı.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-danger hover:bg-danger/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserSettings;
