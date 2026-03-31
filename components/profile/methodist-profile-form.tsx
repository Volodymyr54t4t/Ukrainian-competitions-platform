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
import type { MethodistProfile, Region, City } from '@/lib/types'

interface MethodistProfileFormProps {
  profile: Partial<MethodistProfile>
  onChange: (data: Partial<MethodistProfile>) => void
  regions: Region[]
  cities: City[]
}

export function MethodistProfileForm({
  profile,
  onChange,
  regions,
  cities,
}: MethodistProfileFormProps) {
  const filteredCities = cities.filter(
    (city) => city.region_id === profile.region_id
  )

  const addCompetition = (competition: string) => {
    const competitions = profile.managed_competitions || []
    if (competition && !competitions.includes(competition)) {
      onChange({ managed_competitions: [...competitions, competition] })
    }
  }

  const removeCompetition = (competition: string) => {
    const competitions = profile.managed_competitions || []
    onChange({
      managed_competitions: competitions.filter((c) => c !== competition),
    })
  }

  const addTemplate = (template: string) => {
    const templates = profile.competition_templates || []
    if (template && !templates.includes(template)) {
      onChange({ competition_templates: [...templates, template] })
    }
  }

  const removeTemplate = (template: string) => {
    const templates = profile.competition_templates || []
    onChange({
      competition_templates: templates.filter((t) => t !== template),
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
          <Label htmlFor="organization">Організація</Label>
          <Input
            id="organization"
            value={profile.organization || ''}
            onChange={(e) => onChange({ organization: e.target.value })}
            placeholder="Назва організації"
          />
        </div>
      </div>

      {/* Регіон */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Область / Регіон</Label>
          <Select
            value={profile.region_id?.toString() || ''}
            onValueChange={(value) =>
              onChange({
                region_id: parseInt(value),
                city_id: undefined,
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
            onValueChange={(value) => onChange({ city_id: parseInt(value) })}
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
      </div>

      {/* Напрям діяльності */}
      <div className="space-y-2">
        <Label htmlFor="activity_direction">Напрям діяльності</Label>
        <Textarea
          id="activity_direction"
          value={profile.activity_direction || ''}
          onChange={(e) => onChange({ activity_direction: e.target.value })}
          placeholder="Опишіть ваш напрям діяльності..."
          rows={3}
        />
      </div>

      {/* Конкурси під управлінням */}
      <div className="space-y-2">
        <Label>Конкурси під управлінням</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Додати конкурс"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCompetition((e.target as HTMLInputElement).value)
                ;(e.target as HTMLInputElement).value = ''
              }
            }}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(profile.managed_competitions || []).map((competition) => (
            <Badge key={competition} variant="secondary" className="gap-1">
              {competition}
              <button
                type="button"
                onClick={() => removeCompetition(competition)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Шаблони конкурсів */}
      <div className="space-y-2">
        <Label>Шаблони конкурсів</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Додати шаблон"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTemplate((e.target as HTMLInputElement).value)
                ;(e.target as HTMLInputElement).value = ''
              }
            }}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(profile.competition_templates || []).map((template) => (
            <Badge key={template} variant="outline" className="gap-1">
              {template}
              <button
                type="button"
                onClick={() => removeTemplate(template)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
