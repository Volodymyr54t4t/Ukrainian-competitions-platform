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
import type { JudgeProfile, Region, City } from '@/lib/types'
import { EVALUATION_DIRECTIONS } from '@/lib/types'

interface JudgeProfileFormProps {
  profile: Partial<JudgeProfile>
  onChange: (data: Partial<JudgeProfile>) => void
  regions: Region[]
  cities: City[]
}

export function JudgeProfileForm({
  profile,
  onChange,
  regions,
  cities,
}: JudgeProfileFormProps) {
  const filteredCities = cities.filter(
    (city) => city.region_id === profile.region_id
  )

  const addDirection = (direction: string) => {
    const directions = profile.evaluation_directions || []
    if (!directions.includes(direction)) {
      onChange({ evaluation_directions: [...directions, direction] })
    }
  }

  const removeDirection = (direction: string) => {
    const directions = profile.evaluation_directions || []
    onChange({
      evaluation_directions: directions.filter((d) => d !== direction),
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
          <Label htmlFor="judge_organization">Організація</Label>
          <Input
            id="judge_organization"
            value={profile.judge_organization || ''}
            onChange={(e) => onChange({ judge_organization: e.target.value })}
            placeholder="Назва організації"
          />
        </div>
      </div>

      {/* Локація */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Область</Label>
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
        <div className="space-y-2">
          <Label htmlFor="country">Країна</Label>
          <Input
            id="country"
            value={profile.country || ''}
            onChange={(e) => onChange({ country: e.target.value })}
            placeholder="Україна"
          />
        </div>
      </div>

      {/* Посада та спеціалізація */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="judge_position">Посада</Label>
          <Input
            id="judge_position"
            value={profile.judge_position || ''}
            onChange={(e) => onChange({ judge_position: e.target.value })}
            placeholder="Професор, доцент, тощо"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialization">Спеціалізація</Label>
          <Input
            id="specialization"
            value={profile.specialization || ''}
            onChange={(e) => onChange({ specialization: e.target.value })}
            placeholder="Математика, фізика, тощо"
          />
        </div>
      </div>

      {/* Досвід */}
      <div className="space-y-2">
        <Label htmlFor="judge_experience">Досвід</Label>
        <Textarea
          id="judge_experience"
          value={profile.judge_experience || ''}
          onChange={(e) => onChange({ judge_experience: e.target.value })}
          placeholder="Опишіть ваш досвід оцінювання..."
          rows={3}
        />
      </div>

      {/* Напрями оцінювання */}
      <div className="space-y-2">
        <Label>Напрями оцінювання</Label>
        <Select onValueChange={addDirection}>
          <SelectTrigger>
            <SelectValue placeholder="Додати напрям" />
          </SelectTrigger>
          <SelectContent>
            {EVALUATION_DIRECTIONS.filter(
              (d) => !(profile.evaluation_directions || []).includes(d)
            ).map((direction) => (
              <SelectItem key={direction} value={direction}>
                {direction}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-2 flex flex-wrap gap-2">
          {(profile.evaluation_directions || []).map((direction) => (
            <Badge key={direction} variant="secondary" className="gap-1">
              {direction}
              <button
                type="button"
                onClick={() => removeDirection(direction)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Статистика */}
      <div className="space-y-2">
        <Label htmlFor="works_to_evaluate">Робіт для оцінювання</Label>
        <Input
          id="works_to_evaluate"
          type="number"
          min="0"
          value={profile.works_to_evaluate || ''}
          onChange={(e) =>
            onChange({ works_to_evaluate: parseInt(e.target.value) || undefined })
          }
          placeholder="0"
          disabled
        />
        <p className="text-sm text-muted-foreground">
          Це поле оновлюється автоматично
        </p>
      </div>
    </div>
  )
}
