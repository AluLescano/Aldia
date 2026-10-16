import React from 'react'
import styles from './CardsPage.module.scss'

export const CardsPage: React.FC = () => {
  const {
    container,
    header,
    title,
    subtitle,
    headerButton,
    icon,
    card,
    cardGlow,
    cardHeader,
    cardLabel,
    cardBrand,
    cardNumber,
    cardFooter,
    cardFooterLabel,
    cardFooterValue,
    cardFooterValueMono,
  } = styles

  return (
    <div className={container}>
      <div className={header}>
        <div>
          <h1 className={title}>Payment Methods</h1>
          <p className={subtitle}>Manage mock credit cards and bank accounts</p>
        </div>
        <button type="button" className={headerButton}>
          <svg
            className={icon}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </div>

      {/* Mock Card Preview Sample */}
      <div className={card}>
        {/* Background glow and lines */}
        <div className={cardGlow} />

        <div className={cardHeader}>
          <span className={cardLabel}>Mock Credit Card</span>
          <span className={cardBrand}>VISA</span>
        </div>

        <div>
          <p className={cardNumber}>•••• •••• •••• 4242</p>
        </div>

        <div className={cardFooter}>
          <div>
            <span className={cardFooterLabel}>Cardholder</span>
            <span className={cardFooterValue}>Main Expenses</span>
          </div>
          <div>
            <span className={cardFooterLabel}>Expires</span>
            <span className={cardFooterValueMono}>12/28</span>
          </div>
        </div>
      </div>
    </div>
  )
}
