import React, { useEffect, useState } from 'react';

import type { CattleRecord } from './DairyFarmManagerApp';

type Props = {
  visible: boolean;
  record: CattleRecord | null;
  language: 'english' | 'punjabi';
  onClose: () => void;
  onSave: (updates: Partial<CattleRecord>) => void;
};

export default function EditRecordModal({ visible, record, language, onClose, onSave }: Props) {
  const [form, setForm] = useState<Partial<CattleRecord>>({});

  useEffect(() => {
    if (visible && record) {
      setForm(record);
    } else if (!visible) {
      setForm({});
    }
  }, [visible, record]);

  if (!visible) return null;

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
      <div style={{ background: 'var(--bg)', padding: '1.5rem', borderRadius: 12, maxWidth: 700, width: '95%' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 1rem 0' }}>{language === 'english' ? 'Edit Cattle Record' : 'ਰਿਕਾਰਡ ਸੋਧੋ'}</h3>
        {!record ? (
          <div>{language === 'english' ? 'Loading record...' : 'ਰਿਕਾਰਡ ਲੋਡ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...'}</div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input value={form.breed ?? ''} onChange={(e) => setForm((p) => ({ ...p, breed: e.target.value }))} placeholder={language === 'english' ? 'Breed' : 'ਨਸਲ'} style={{ padding: '0.5rem' }} />
              <input value={form.tagNo ?? ''} onChange={(e) => setForm((p) => ({ ...p, tagNo: e.target.value }))} placeholder={language === 'english' ? 'Tag No.' : 'ਟੈਗ ਨੰਬਰ'} style={{ padding: '0.5rem' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input value={form.birthDate ?? ''} onChange={(e) => setForm((p) => ({ ...p, birthDate: e.target.value }))} type="date" style={{ padding: '0.5rem' }} />
              <input value={form.motherCode ?? ''} onChange={(e) => setForm((p) => ({ ...p, motherCode: e.target.value }))} placeholder={language === 'english' ? 'Mother Code' : 'ਮਾਂ ਕੋਡ'} style={{ padding: '0.5rem' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input value={form.fatherName ?? ''} onChange={(e) => setForm((p) => ({ ...p, fatherName: e.target.value }))} placeholder={language === 'english' ? 'Father Name' : 'ਪਿਤਾ ਨਾਮ'} style={{ padding: '0.5rem' }} />
              <input value={form.lactation ? String(form.lactation) : ''} onChange={(e) => setForm((p) => ({ ...p, lactation: e.target.value === '' ? undefined : parseInt(e.target.value) }))} type="number" min={1} placeholder={language === 'english' ? 'Lactation' : 'ਦੁੱਧ'} style={{ padding: '0.5rem' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input value={form.aiLastCheckup ?? ''} onChange={(e) => setForm((p) => ({ ...p, aiLastCheckup: e.target.value }))} type="date" style={{ padding: '0.5rem' }} />
              <input value={form.heatCycle ?? ''} onChange={(e) => setForm((p) => ({ ...p, heatCycle: e.target.value }))} placeholder={language === 'english' ? 'Heat Cycle' : 'ਗਰਮੀ ਚੱਕਰ'} style={{ padding: '0.5rem' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input value={form.deworming ?? ''} onChange={(e) => setForm((p) => ({ ...p, deworming: e.target.value }))} type="date" style={{ padding: '0.5rem' }} />
              <input value={form.semenDetail ?? ''} onChange={(e) => setForm((p) => ({ ...p, semenDetail: e.target.value }))} placeholder={language === 'english' ? 'Semen Detail' : 'ਵੀਰਜ ਵੇਰਵਾ'} style={{ padding: '0.5rem' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={onClose} style={{ padding: '0.5rem 1rem' }}>{language === 'english' ? 'Cancel' : 'ਰੱਦ ਕਰੋ'}</button>
              <button
                type="button"
                onClick={() => {
                  if (!record) return;
                  const updates: Partial<CattleRecord> = {
                    breed: form.breed ?? record.breed,
                    tagNo: form.tagNo ?? record.tagNo,
                    birthDate: form.birthDate ?? record.birthDate,
                    motherCode: form.motherCode ?? record.motherCode,
                    fatherName: form.fatherName ?? record.fatherName,
                    lactation: typeof form.lactation === 'number' ? form.lactation : (form.lactation ? parseInt(String(form.lactation)) : record.lactation),
                    aiLastCheckup: form.aiLastCheckup ?? record.aiLastCheckup,
                    heatCycle: form.heatCycle ?? record.heatCycle,
                    deworming: form.deworming ?? record.deworming,
                    semenDetail: form.semenDetail ?? record.semenDetail,
                  };
                  onSave(updates);
                }}
                style={{ padding: '0.5rem 1rem', background: 'var(--accent)', color: 'white', border: 'none' }}
              >
                {language === 'english' ? 'Save' : 'ਸੇਵ'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
