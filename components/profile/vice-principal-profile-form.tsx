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
import type { VicePrincipalProfile, School, Region, City } from '@/lib/types'

interface VicePrincipalProfileFormProps {
  profile: Partial<VicePrincipalProfile>
  onChange: (data: Partial<VicePrincipalProfile>) => void
  schools: School[]
  regions: Region[]
  cities: City[]
}

export function VicePrincipalProfileForm({
  profile,
  onChange,
  schools,
  regions,
  cities,
}: VicePrincipalProfileFormProps) {
  const filteredCities = cities.filter(
    (city) => city.region_id === profile.region_id
  )
  const filteredSchools = schools.filter(
    (school) => school.city_id === profile.city_id
  )

  const updateContactInfo = (key: string, value: string) => {
    onChange({
      school_contact_info: {
        ...profile.school_contact_info,
        [key]: value,
      },
    })
  }

  const updateStatistics = (key: string, value: number) => {
    onChange({
      school_statistics: {
        ...profile.school_statistics,
        [key]: value,
      },
    })
  }

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
        <div className="space-y-2">
          <Label htmlFor="phone">Телефон</Label>
          <Input
            id="phone"
            value={profile.phone || ''}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+380 XX XXX XX XX"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="position">Посада</Label>
          <Input
            id="position"
            value={profile.position || ''}
            onChange={(e) => onChange({ position: e.target.value })}
            placeholder="Заступник директора з НВР"
          />
        </div>
      </div>

      {/* Локація та навчальний заклад */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Область</Label>
          <Select
            value={profile.region_id?.toString() || ''}
            onValueChange={(value) =>
              onChange({
                region_id: parseInt(value),
                city_id: undefined,
                school_id: undefined,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Оберіть область" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id.toString()}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Місто</Label>
          <Select
            value={profile.city_id?.toString() || ''}
            onValueChange={(value) =>
              onChange({ city_id: parseInt(value), school_id: undefined })
            }
            disabled={!profile.region_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Оберіть місто" />
            </SelectTrigger>
            <SelectContent>
              {filteredCities.map((city) => (
                <SelectItem key={city.id} value={city.id.toString()}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Школа</Label>
          <Select
            value={profile.school_id?.toString() || ''}
            onValueChange={(value) => onChange({ school_id: parseInt(value) })}
            disabled={!profile.city_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Оберіть школу" />
            </SelectTrigger>
            <SelectContent>
              {filteredSchools.map((school) => (
                <SelectItem key={school.id} value={school.id.toString()}>
                  {school.short_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Контактні дані школи */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Контактні дані школи</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="school_phone">Телефон школи</Label>
            <Input
              id="school_phone"
              value={profile.school_contact_info?.phone || ''}
              onChange={(e) => updateContactInfo('phone', e.target.value)}
              placeholder="+380 XX XXX XX XX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="school_email">Email школи</Label>
            <Input
              id="school_email"
              type="email"
              value={profile.school_contact_info?.email || ''}
              onChange={(e) => updateContactInfo('email', e.target.value)}
              placeholder="school@example.com"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="school_website">Веб-сайт школи</Label>
            <Input
              id="school_website"
              type="url"
              value={profile.school_contact_info?.website || ''}
              onChange={(e) => updateContactInfo('website', e.target.value)}
              placeholder="https://school.edu.ua"
            />
          </div>
        </div>
      </div>

      {/* Статистика школи */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Статистика школи</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="students_count">Кількість учнів</Label>
            <Input
              id="students_count"
              type="number"
              min="0"
              value={profile.school_statistics?.students_count || ''}
              onChange={(e) =>
                updateStatistics('students_count', parseInt(e.target.value) || 0)
              }
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="teachers_count">Кількість вчителів</Label>
            <Input
              id="teachers_count"
              type="number"
              min="0"
              value={profile.school_statistics?.teachers_count || ''}
              onChange={(e) =>
                updateStatistics('teachers_count', parseInt(e.target.value) || 0)
              }
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="participants_count">Учасників конкурсів</Label>
            <Input
              id="participants_count"
              type="number"
              min="0"
              value={profile.participants_count || ''}
              onChange={(e) =>
                onChange({
                  participants_count: parseInt(e.target.value) || undefined,
                })
              }
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="victories_count">Кількість перемог</Label>
            <Input
              id="victories_count"
              type="number"
              min="0"
              value={profile.victories_count || ''}
              onChange={(e) =>
                onChange({
                  victories_count: parseInt(e.target.value) || undefined,
                })
              }
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Рейтинг школи */}
      <div className="space-y-2">
        <Label htmlFor="school_rating">Рейтинг школи (1-10)</Label>
        <Input
          id="school_rating"
          type="number"
          min="1"
          max="10"
          step="0.1"
          value={profile.school_rating || ''}
          onChange={(e) =>
            onChange({ school_rating: parseFloat(e.target.value) || undefined })
          }
          placeholder="1-10"
        />
      </div>
    </div>
  )
}
