'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AdminProfile } from '@/lib/types'

interface AdminProfileFormProps {
  profile: Partial<AdminProfile>
  onChange: (data: Partial<AdminProfile>) => void
}

export function AdminProfileForm({
  profile,
  onChange,
}: AdminProfileFormProps) {
  return (
    <div className="space-y-6">
      {/* Основна інформація */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">Ім&apos;я *</Label>
          <Input
            id="first_name"
            value={profile.first_name || ''}
            onChange={(e) => onChange({ first_name: e.target.value })}
            placeholder="Введіть ім'я"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Прізвище *</Label>
          <Input
            id="last_name"
            value={profile.last_name || ''}
            onChange={(e) => onChange({ last_name: e.target.value })}
            placeholder="Введіть прізвище"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="middle_name">По батькові</Label>
          <Input
            id="middle_name"
            value={profile.middle_name || ''}
            onChange={(e) => onChange({ middle_name: e.target.value })}
            placeholder="Введіть по батькові"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={profile.email || ''}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="email@example.com"
          />
        </div>
      </div>

      {/* Роль адміна */}
      <div className="space-y-2">
        <Label>Роль адміністратора</Label>
        <Select
          value={profile.admin_role || ''}
          onValueChange={(value) =>
            onChange({ admin_role: value as 'super_admin' | 'support' })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Оберіть роль" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="support">Support</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Super Admin має повний доступ до всіх функцій системи. Support має
          обмежений доступ для підтримки користувачів.
        </p>
      </div>

      {/* Інформація про акаунт */}
      <div className="rounded-lg border p-4 bg-muted/50">
        <h3 className="text-sm font-medium mb-2">Інформація про акаунт</h3>
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Статус верифікації:</span>
            <span className={profile.is_verified ? 'text-green-600' : 'text-yellow-600'}>
              {profile.is_verified ? 'Верифіковано' : 'Не верифіковано'}
            </span>
          </div>
          {profile.created_at && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Дата реєстрації:</span>
              <span>{new Date(profile.created_at).toLocaleDateString('uk-UA')}</span>
            </div>
          )}
          {profile.last_login && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Останній вхід:</span>
              <span>{new Date(profile.last_login).toLocaleString('uk-UA')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
