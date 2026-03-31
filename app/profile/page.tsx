'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Save, User, Shield, CheckCircle2 } from 'lucide-react'
import type { UserRole, UserProfile, StudentProfile, TeacherProfile, VicePrincipalProfile, MethodistProfile, JudgeProfile, AdminProfile } from '@/lib/types'
import { ROLE_LABELS } from '@/lib/types'
import { REGIONS, CITIES, SCHOOLS_ZHYTOMYR } from '@/lib/mock-data'
import { StudentProfileForm } from '@/components/profile/student-profile-form'
import { TeacherProfileForm } from '@/components/profile/teacher-profile-form'
import { VicePrincipalProfileForm } from '@/components/profile/vice-principal-profile-form'
import { MethodistProfileForm } from '@/components/profile/methodist-profile-form'
import { JudgeProfileForm } from '@/components/profile/judge-profile-form'
import { AdminProfileForm } from '@/components/profile/admin-profile-form'

// Demo user для тестування
const DEMO_USER = {
  id: 1,
  first_name: 'Іван',
  last_name: 'Петренко',
  email: 'ivan.petrenko@example.com',
  is_verified: true,
  created_at: '2024-01-15T10:00:00Z',
}

export default function ProfilePage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Profile state for each role
  const [studentProfile, setStudentProfile] = useState<Partial<StudentProfile>>({
    ...DEMO_USER,
    role: 'student',
    region_id: 5, // Житомирська область
    city_id: 1, // Житомир
  })

  const [teacherProfile, setTeacherProfile] = useState<Partial<TeacherProfile>>({
    ...DEMO_USER,
    role: 'teacher',
    region_id: 5,
    city_id: 1,
  })

  const [vicePrincipalProfile, setVicePrincipalProfile] = useState<Partial<VicePrincipalProfile>>({
    ...DEMO_USER,
    role: 'vice_principal',
    region_id: 5,
    city_id: 1,
  })

  const [methodistProfile, setMethodistProfile] = useState<Partial<MethodistProfile>>({
    ...DEMO_USER,
    role: 'methodist',
    region_id: 5,
    city_id: 1,
  })

  const [judgeProfile, setJudgeProfile] = useState<Partial<JudgeProfile>>({
    ...DEMO_USER,
    role: 'judge',
    region_id: 5,
    city_id: 1,
    country: 'Україна',
  })

  const [adminProfile, setAdminProfile] = useState<Partial<AdminProfile>>({
    ...DEMO_USER,
    role: 'admin',
    admin_role: 'super_admin',
  })

  const getCurrentProfile = (): Partial<UserProfile> => {
    switch (selectedRole) {
      case 'student':
        return studentProfile
      case 'teacher':
        return teacherProfile
      case 'vice_principal':
        return vicePrincipalProfile
      case 'methodist':
        return methodistProfile
      case 'judge':
        return judgeProfile
      case 'admin':
        return adminProfile
      default:
        return studentProfile
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)

    // Імітація збереження в базу даних
    // В реальному проекті тут буде API виклик
    const profile = getCurrentProfile()
    console.log('[v0] Saving profile:', profile)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const currentProfile = getCurrentProfile()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Профіль користувача</h1>
          <p className="text-muted-foreground mt-2">
            Керуйте своїми особистими даними та налаштуваннями
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={currentProfile.avatar_url} />
                    <AvatarFallback className="text-2xl bg-primary/10">
                      {getInitials(currentProfile.first_name, currentProfile.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold">
                    {currentProfile.first_name} {currentProfile.last_name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentProfile.email}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <User className="h-3 w-3" />
                      {ROLE_LABELS[selectedRole]}
                    </Badge>
                    {currentProfile.is_verified && (
                      <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Верифіковано
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Role switcher for demo */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Перегляд як роль:
                  </label>
                  <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Учень</SelectItem>
                      <SelectItem value="teacher">Вчитель</SelectItem>
                      <SelectItem value="vice_principal">Завуч</SelectItem>
                      <SelectItem value="methodist">Методист</SelectItem>
                      <SelectItem value="judge">Журі</SelectItem>
                      <SelectItem value="admin">Адмін</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Демо-режим: перемикайте ролі для перегляду різних форм профілю
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Редагування профілю</CardTitle>
                <CardDescription>
                  Заповніть інформацію про себе. Поля позначені * є обов&apos;язковими.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="personal">Особиста інформація</TabsTrigger>
                    <TabsTrigger value="additional">Додаткова інформація</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="mt-0">
                    {selectedRole === 'student' && (
                      <StudentProfileForm
                        profile={studentProfile}
                        onChange={(data) => setStudentProfile((prev) => ({ ...prev, ...data }))}
                        schools={SCHOOLS_ZHYTOMYR}
                        regions={REGIONS}
                        cities={CITIES}
                      />
                    )}

                    {selectedRole === 'teacher' && (
                      <TeacherProfileForm
                        profile={teacherProfile}
                        onChange={(data) => setTeacherProfile((prev) => ({ ...prev, ...data }))}
                        schools={SCHOOLS_ZHYTOMYR}
                        regions={REGIONS}
                        cities={CITIES}
                      />
                    )}

                    {selectedRole === 'vice_principal' && (
                      <VicePrincipalProfileForm
                        profile={vicePrincipalProfile}
                        onChange={(data) => setVicePrincipalProfile((prev) => ({ ...prev, ...data }))}
                        schools={SCHOOLS_ZHYTOMYR}
                        regions={REGIONS}
                        cities={CITIES}
                      />
                    )}

                    {selectedRole === 'methodist' && (
                      <MethodistProfileForm
                        profile={methodistProfile}
                        onChange={(data) => setMethodistProfile((prev) => ({ ...prev, ...data }))}
                        regions={REGIONS}
                        cities={CITIES}
                      />
                    )}

                    {selectedRole === 'judge' && (
                      <JudgeProfileForm
                        profile={judgeProfile}
                        onChange={(data) => setJudgeProfile((prev) => ({ ...prev, ...data }))}
                        regions={REGIONS}
                        cities={CITIES}
                      />
                    )}

                    {selectedRole === 'admin' && (
                      <AdminProfileForm
                        profile={adminProfile}
                        onChange={(data) => setAdminProfile((prev) => ({ ...prev, ...data }))}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="additional" className="mt-0">
                    <div className="rounded-lg border p-6 bg-muted/30">
                      <h3 className="text-lg font-medium mb-4">Системна інформація</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-muted-foreground">ID користувача</p>
                          <p className="font-mono">{currentProfile.user_id || DEMO_USER.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Роль</p>
                          <p>{ROLE_LABELS[selectedRole]}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Дата реєстрації</p>
                          <p>{currentProfile.created_at ? new Date(currentProfile.created_at).toLocaleDateString('uk-UA') : '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Останній вхід</p>
                          <p>{currentProfile.last_login ? new Date(currentProfile.last_login).toLocaleString('uk-UA') : '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Статус верифікації</p>
                          <p className={currentProfile.is_verified ? 'text-green-600' : 'text-yellow-600'}>
                            {currentProfile.is_verified ? 'Верифіковано' : 'Очікує верифікації'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Separator className="my-6" />

                <div className="flex items-center justify-between">
                  <div>
                    {saveSuccess && (
                      <p className="text-sm text-green-600 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Профіль успішно збережено!
                      </p>
                    )}
                  </div>
                  <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Збереження...' : 'Зберегти зміни'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
