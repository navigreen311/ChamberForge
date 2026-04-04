import { NextResponse } from 'next/server'

const householdData: Record<string, object> = {
  'c-001': {
    client_id: 'c-001',
    people: [
      { name: 'Jonathan Wellington III', role: 'primary' },
      { name: 'Catherine Wellington', role: 'spouse' },
      { name: 'James Wellington', role: 'adult-child' },
      { name: 'Elizabeth Wellington', role: 'adult-child' },
      { name: 'Harold Wellington Jr.', role: 'parent' },
    ],
    vendors: [
      { name: 'Morrison & Associates LLP', type: 'legal' },
      { name: 'Deloitte Private', type: 'accounting' },
      { name: 'Sotheby\'s Concierge', type: 'lifestyle' },
    ],
    properties: [
      { address: '1240 Park Avenue, New York, NY', type: 'primary-residence' },
      { address: '88 Oceanview Dr, Palm Beach, FL', type: 'vacation' },
      { address: '15 Rue de Rivoli, Paris, France', type: 'investment' },
      { address: '200 Commerce Blvd, Greenwich, CT', type: 'commercial' },
    ],
    people_count: 5,
    vendor_count: 3,
    property_count: 4,
  },
  'c-003': {
    client_id: 'c-003',
    people: [
      { name: 'Elena Rivera', role: 'primary' },
      { name: 'Marco Rivera', role: 'spouse' },
      { name: 'Sofia Rivera', role: 'adult-child' },
    ],
    vendors: [
      { name: 'Baker McKenzie', type: 'legal' },
      { name: 'KPMG Foundation Services', type: 'accounting' },
      { name: 'Bridgespan Group', type: 'philanthropic-advisory' },
      { name: 'Cambridge Associates', type: 'investment' },
      { name: 'Northern Trust', type: 'custody' },
    ],
    properties: [
      { address: '450 Coral Way, Miami, FL', type: 'primary-residence' },
      { address: '12 Beacon Hill, Boston, MA', type: 'foundation-office' },
    ],
    people_count: 3,
    vendor_count: 5,
    property_count: 2,
  },
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const data = householdData[params.id]

  if (!data) {
    return NextResponse.json(
      { error: 'Household data not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(data)
}
