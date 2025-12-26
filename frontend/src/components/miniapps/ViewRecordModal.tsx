import React from 'react';
import { translations } from './translations';

type Props = {
  visible: boolean;
  record: any | null;
  language: 'english' | 'punjabi';
  onClose: () => void;
};

export default function ViewRecordModal({
  visible,
  record,
  language,
  onClose,
}: Props) {
  if (!visible) return null;
  const t = translations[language];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          background: 'var(--bg)',
          padding: '1.5rem',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 1rem 0' }}>
          {language === 'english' ? 'View Cattle Record' : 'ਰਿਕਾਰਡ ਦੇ ਵੇਰਵੇ'}
        </h3>
        {!record ? (
          <div>
            {language === 'english' ? 'Loading...' : 'ਲੋਡ ਕਰ ਰਿਹਾ ਹੈ...'}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <div>
              <strong>{t.breed}:</strong> {record.breed}
            </div>
            <div>
              <strong>{t.tagNo}:</strong> {record.tagNo}
            </div>
            <div>
              <strong>{t.birthDate}:</strong> {record.birthDate}
            </div>
            <div>
              <strong>{t.motherCode}:</strong> {record.motherCode}
            </div>
            <div>
              <strong>{t.fatherName}:</strong> {record.fatherName}
            </div>
            <div>
              <strong>{t.lactation}:</strong> {record.lactation}
            </div>
            <div>
              <strong>{t.aiLastCheckup}:</strong> {record.aiLastCheckup}
            </div>
            <div>
              <strong>{t.heatCycle}:</strong> {record.heatCycle}
            </div>
            <div>
              <strong>{t.deworming}:</strong> {record.deworming}
            </div>
            <div>
              <strong>{t.semenDetail}:</strong> {record.semenDetail}
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: '1rem',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.5rem',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '0.5rem 1rem' }}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
