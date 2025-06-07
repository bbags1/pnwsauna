'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from './ui/checkbox'
import { supabase } from '@/lib/supabase'

interface LiabilityWaiverProps {
  customerName: string
  customerEmail: string
  customerPhone: string
  onWaiverSigned: (waiverId: string) => void
  onCancel: () => void
}

const WAIVER_TEXT = `
ASSUMPTION OF RISK, WAIVER OF CLAIMS, AND INDEMNITY AGREEMENT

I, the undersigned participant, acknowledge that I am participating in sauna activities at PNW Sauna ("the Facility") which involve inherent risks including but not limited to:

1. RISKS: I understand that sauna use involves exposure to high temperatures, steam, and potential dehydration, which may result in:
   - Heat exhaustion, heat stroke, or dehydration
   - Cardiovascular stress or complications
   - Fainting, dizziness, or disorientation
   - Burns from hot surfaces or steam
   - Slips, falls, or other physical injuries
   - Allergic reactions or respiratory issues

2. MEDICAL CONDITIONS: I certify that I am in good physical condition and have no medical conditions that would prevent my safe participation in sauna activities. I understand that I should consult with a physician before participating if I have any concerns about my health.

3. ASSUMPTION OF RISK: I voluntarily assume all risks associated with sauna use, whether known or unknown, and understand that these activities may result in serious injury or death.

4. WAIVER OF CLAIMS: I hereby waive, release, and discharge PNW Sauna, its owners, operators, employees, and agents from any and all claims, demands, or causes of action arising from my use of the sauna facilities.

5. INDEMNIFICATION: I agree to indemnify and hold harmless PNW Sauna from any claims brought by third parties arising from my participation in sauna activities.

6. EMERGENCY CONTACT: I authorize PNW Sauna to contact emergency services and my emergency contact in case of medical emergency.

I have read this waiver thoroughly, understand its contents, and agree to be bound by its terms.
`

export default function LiabilityWaiver({
  customerName,
  customerEmail,
  customerPhone,
  onWaiverSigned,
  onCancel
}: LiabilityWaiverProps) {
  const [agreed, setAgreed] = useState(false)
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed || !emergencyName || !emergencyPhone) {
      setError('Please complete all fields and agree to the waiver')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser()
      
      // Get client IP and user agent for record keeping
      const userAgent = navigator.userAgent
      
      // Create waiver record with full text
      const { data: waiver, error: waiverError } = await supabase
        .from('liability_waivers')
        .insert({
          user_id: user?.id || null,
          user_email: customerEmail,
          user_name: customerName,
          user_phone: customerPhone,
          emergency_contact_name: emergencyName,
          emergency_contact_phone: emergencyPhone,
          waiver_version: '1.0',
          waiver_text: WAIVER_TEXT,
          user_agent: userAgent,
        })
        .select()
        .single()

      if (waiverError) {
        throw new Error('Failed to save waiver: ' + waiverError.message)
      }

      onWaiverSigned(waiver.id)
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Liability Waiver</h2>
          <p className="text-gray-600 mt-2">
            Please read and sign this waiver before proceeding with your booking.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Participant Information:</h3>
            <p><strong>Name:</strong> {customerName}</p>
            <p><strong>Email:</strong> {customerEmail}</p>
            <p><strong>Phone:</strong> {customerPhone}</p>
          </div>

          <div className="prose prose-sm max-w-none mb-6">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
              {WAIVER_TEXT}
            </pre>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Name *
                </label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Phone *
                </label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="waiver-agreement"
                checked={agreed}
                onCheckedChange={(checked: boolean) => setAgreed(checked)}
              />
              <label htmlFor="waiver-agreement" className="text-sm text-gray-700 leading-5">
                I have read, understood, and agree to the terms of this liability waiver. 
                I acknowledge that I am signing this waiver voluntarily and that it constitutes 
                a legally binding agreement.
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!agreed || !emergencyName || !emergencyPhone || loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Signing...' : 'Sign Waiver & Continue'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 