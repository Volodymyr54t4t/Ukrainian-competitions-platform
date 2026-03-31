'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { StudentProfile, School, Region, City } from '@/lib/types'
import { SUBJECTS, GRADES, PARTICIPATION_LEVELS } from '@/lib/types'

interface StudentProfileFormProps {
  profile: Partial<StudentProfile>
  onChange: (data: Partial<StudentProfile>) => void
  schools: School[]
  regions: Region[]
  cities: City[]
}

export function StudentProfileForm({
  profile,
  onChange,
  schools,
  regions,
  cities,
}: StudentProfileFormProps) {
  const filteredCities = cities.filter(
    (city) => city.region_id === profile.region_id
  )
  const filteredSchools = schools.filter(
    (school) => school.city_id === profile.city_id
  )

  const addInterest = (subject: string) => {
    const interests = profile.interests || []
    if (!interests.includes(subject)) {
      onChange({ interests: [...interests, subject] })
    }
  }

  const removeInterest = (subject: string) => {
    const interests = profile.interests || []
    onChange({ interests: interests.filter((i) => i !== subject) })
  }

  const addStrength = (strength: string) => {
    const strengths = profile.strengths || []
    if (strength && !strengths.includes(strength)) {
      onChange({ strengths: [...strengths, strength] })
    }
  }

  const removeStrength = (strength: string) => {
    const strengths = profile.strengths || []
    onChange({ strengths: strengths.filter((s) => s !== strength) })
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
          <Label htmlFor="date_of_birth">Дата народження</Label>
          <Input
            id="date_of_birth"
            type="date"
            value={profile.date_of_birth || ''}
            onChange={(e) => onChange({ date_of_birth: e.target.value })}
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
          <Label>Навчальний заклад</Label>
          <Select
            value={profile.school_id?.toString() || ''}
            onValueChange={(value) => onChange({ school_id: parseInt(value) })}
            disabled={!profile.city_id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Оберіть навчальний заклад" />
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
        <div className="space-y-2">
          <Label>Клас</Label>
          <Select
            value={profile.grade || ''}
            onValueChange={(value) => onChange({ grade: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Оберіть клас" />
            </SelectTrigger>
            <SelectContent>
              {GRADES.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade} клас
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="average_score">Середній бал</Label>
          <Input
            id="average_score"
            type="number"
            min="1"
            max="12"
            step="0.01"
            value={profile.average_score || ''}
            onChange={(e) =>
              onChange({ average_score: parseFloat(e.target.value) || undefined })
            }
            placeholder="1-12"
          />
        </div>
      </div>

      {/* Предмети інтересу */}
      <div className="space-y-2">
        <Label>Предмети інтересу</Label>
        <Select onValueChange={addInterest}>
          <SelectTrigger>
            <SelectValue placeholder="Додати предмет" />
          </SelectTrigger>
          <SelectContent>
            {SUBJECTS.filter((s) => !(profile.interests || []).includes(s)).map(
              (subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        <div className="mt-2 flex flex-wrap gap-2">
          {(profile.interests || []).map((interest) => (
            <Badge key={interest} variant="secondary" className="gap-1">
              {interest}
              <button
                type="button"
                onClick={() => removeInterest(interest)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Рівень участі */}
      <div className="space-y-2">
        <Label>Рівень участі</Label>
        <Select
          value={profile.participation_level || ''}
          onValueChange={(value) => onChange({ participation_level: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Оберіть рівень" />
          </SelectTrigger>
          <SelectContent>
            {PARTICIPATION_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Досягнення та сильні сторони */}
      <div className="space-y-2">
        <Label htmlFor="achievements">Досягнення</Label>
        <Textarea
          id="achievements"
          value={profile.achievements || ''}
          onChange={(e) => onChange({ achievements: e.target.value })}
          placeholder="Опишіть ваші досягнення..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Сильні сторони</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Додати сильну сторону"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addStrength((e.target as HTMLInputElement).value)
                ;(e.target as HTMLInputElement).value = ''
              }
            }}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(profile.strengths || []).map((strength) => (
            <Badge key={strength} variant="outline" className="gap-1">
              {strength}
              <button
                type="button"
                onClick={() => removeStrength(strength)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Посилання */}
      <div className="space-y-2">
        <Label htmlFor="portfolio_url">Портфоліо / GitHub</Label>
        <Input
          id="portfolio_url"
          type="url"
          value={profile.portfolio_url || ''}
          onChange={(e) => onChange({ portfolio_url: e.target.value })}
          placeholder="https://github.com/username"
        />
      </div>
    </div>
  )
}
