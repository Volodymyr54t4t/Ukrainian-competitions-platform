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
import type { TeacherProfile, School, Region, City } from '@/lib/types'
import { SUBJECTS, GRADES } from '@/lib/types'

interface TeacherProfileFormProps {
  profile: Partial<TeacherProfile>
  onChange: (data: Partial<TeacherProfile>) => void
  schools: School[]
  regions: Region[]
  cities: City[]
}

export function TeacherProfileForm({
  profile,
  onChange,
  schools,
  regions,
  cities,
}: TeacherProfileFormProps) {
  const filteredCities = cities.filter(
    (city) => city.region_id === profile.region_id
  )
  const filteredSchools = schools.filter(
    (school) => school.city_id === profile.city_id
  )

  const addSubject = (subject: string) => {
    const subjects = profile.subjects || []
    if (!subjects.includes(subject)) {
      onChange({ subjects: [...subjects, subject] })
    }
  }

  const removeSubject = (subject: string) => {
    const subjects = profile.subjects || []
    onChange({ subjects: subjects.filter((s) => s !== subject) })
  }

  const addTeachingGrade = (grade: string) => {
    const grades = profile.teaching_grades || []
    if (!grades.includes(grade)) {
      onChange({ teaching_grades: [...grades, grade] })
    }
  }

  const removeTeachingGrade = (grade: string) => {
    const grades = profile.teaching_grades || []
    onChange({ teaching_grades: grades.filter((g) => g !== grade) })
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
            placeholder="Вчитель математики"
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
      </div>

      {/* Досвід */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="experience_years">Стаж роботи (років)</Label>
          <Input
            id="experience_years"
            type="number"
            min="0"
            max="50"
            value={profile.experience_years || ''}
            onChange={(e) =>
              onChange({ experience_years: parseInt(e.target.value) || undefined })
            }
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="winners_count">Кількість переможців</Label>
          <Input
            id="winners_count"
            type="number"
            min="0"
            value={profile.winners_count || ''}
            onChange={(e) =>
              onChange({ winners_count: parseInt(e.target.value) || undefined })
            }
            placeholder="0"
          />
        </div>
      </div>

      {/* Предмети викладання */}
      <div className="space-y-2">
        <Label>Предмети викладання</Label>
        <Select onValueChange={addSubject}>
          <SelectTrigger>
            <SelectValue placeholder="Додати предмет" />
          </SelectTrigger>
          <SelectContent>
            {SUBJECTS.filter((s) => !(profile.subjects || []).includes(s)).map(
              (subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        <div className="mt-2 flex flex-wrap gap-2">
          {(profile.subjects || []).map((subject) => (
            <Badge key={subject} variant="secondary" className="gap-1">
              {subject}
              <button
                type="button"
                onClick={() => removeSubject(subject)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Класи */}
      <div className="space-y-2">
        <Label>Класи викладання</Label>
        <Select onValueChange={addTeachingGrade}>
          <SelectTrigger>
            <SelectValue placeholder="Додати клас" />
          </SelectTrigger>
          <SelectContent>
            {GRADES.filter(
              (g) => !(profile.teaching_grades || []).includes(g)
            ).map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade} клас
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-2 flex flex-wrap gap-2">
          {(profile.teaching_grades || []).map((grade) => (
            <Badge key={grade} variant="outline" className="gap-1">
              {grade} клас
              <button
                type="button"
                onClick={() => removeTeachingGrade(grade)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Досягнення та досвід */}
      <div className="space-y-2">
        <Label htmlFor="student_achievements">Досягнення учнів</Label>
        <Textarea
          id="student_achievements"
          value={profile.student_achievements || ''}
          onChange={(e) => onChange({ student_achievements: e.target.value })}
          placeholder="Опишіть досягнення ваших учнів..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preparation_experience">Досвід підготовки</Label>
        <Textarea
          id="preparation_experience"
          value={profile.preparation_experience || ''}
          onChange={(e) => onChange({ preparation_experience: e.target.value })}
          placeholder="Опишіть ваш досвід підготовки учнів до конкурсів..."
          rows={3}
        />
      </div>

      {/* Портфоліо */}
      <div className="space-y-2">
        <Label htmlFor="teacher_portfolio_url">Портфоліо</Label>
        <Input
          id="teacher_portfolio_url"
          type="url"
          value={profile.teacher_portfolio_url || ''}
          onChange={(e) => onChange({ teacher_portfolio_url: e.target.value })}
          placeholder="https://portfolio.example.com"
        />
      </div>
    </div>
  )
}
