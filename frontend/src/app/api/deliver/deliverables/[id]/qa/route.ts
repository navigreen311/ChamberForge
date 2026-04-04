import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const { qa_items } = body

  if (!qa_items || !Array.isArray(qa_items)) {
    return NextResponse.json(
      { error: 'qa_items array is required' },
      { status: 400 }
    )
  }

  const qa_score = qa_items.filter((item: { passed: boolean }) => item.passed).length
  const qa_total = qa_items.length

  return NextResponse.json({
    id: params.id,
    qa_items,
    qa_score,
    qa_total,
    updated_at: new Date().toISOString(),
  })
}
