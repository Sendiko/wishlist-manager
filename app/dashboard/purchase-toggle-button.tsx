'use client'

import { toggleItemPurchased } from '@/app/actions/item'
import { useTransition } from 'react'

interface PurchaseToggleButtonProps {
    itemId: string
    isPurchased: boolean
}

export default function PurchaseToggleButton({ itemId, isPurchased }: PurchaseToggleButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent triggering the card click
        startTransition(async () => {
            await toggleItemPurchased(itemId, isPurchased)
        })
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`w-full py-2 px-3 rounded-md text-xs font-medium transition-colors ${isPurchased
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-surface-container-highest text-on-surface hover:bg-surface-container-highest/80'
                } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {isPending ? '...' : isPurchased ? 'Sudah Dibeli ✅' : 'Tandai Dibeli'}
        </button>
    )
}
