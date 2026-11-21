import { describe, expect, it } from 'vitest'
import { PLUGINS, searchProcedures } from '../src/plugins/registry'

describe('cita previa DNI map', () => {
  const dni = PLUGINS.find((p) => p.id === 'cita-dni')!
  const booking = dni.procedures.find((p) => p.id === 'pedir-cita')!

  it('identifies people with the data printed on their ID card', () => {
    expect(booking.login).toEqual(['datos_documento'])
  })

  it('walks the observed form field by field, and leaves «Enviar datos» to the person', () => {
    const titles = booking.steps.map((s) => s.title)
    for (const step of ['Número y letra del documento', 'Equipo de expedición', 'Fecha de validez', 'Número de soporte', 'Código de seguridad', 'Enviar los datos']) {
      expect(titles).toContain(step)
    }
    expect(dni.user_only).toContain('Enviar datos')
    expect(booking.steps.find((s) => s.title === 'Enviar los datos')?.user_only).toEqual(['Enviar datos'])
  })

  it('is found from what people say', () => {
    expect(searchProcedures('quiero pedir cita para renovar el DNI')[0]?.procedure.id).toBe('pedir-cita')
  })
})
