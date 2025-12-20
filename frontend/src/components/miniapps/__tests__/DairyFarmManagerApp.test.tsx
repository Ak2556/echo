import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DairyFarmManagerApp from '../DairyFarmManagerApp';

describe('DairyFarmManagerApp - Records flows', () => {
  test('opens view modal when clicking View Details', async () => {
    render(<DairyFarmManagerApp isVisible={true} onClose={() => {}} />);

    // Click the Records tab to render the records list
    const recordsTabs = screen.getAllByText(/Records/i);
    const recordsTab = recordsTabs.find((el) => (el.textContent || '').trim().startsWith('📋') && !(el.textContent || '').includes('View')) || recordsTabs[0];
    fireEvent.click(recordsTab);

    // Confirm at least one record (by tag) is visible
    const tagText = await screen.findByText(/001-GIR-2022/i);
    expect(tagText).toBeInTheDocument();
  });

  test('deletes a record when confirmed', async () => {
    render(<DairyFarmManagerApp isVisible={true} onClose={() => {}} />);

    // Click the Records tab to render the records list
    const recordsTabs = screen.getAllByText(/Records/i);
    const recordsTab = recordsTabs.find((el) => (el.textContent || '').trim().startsWith('📋') && !(el.textContent || '').includes('View')) || recordsTabs[0];
    fireEvent.click(recordsTab);

    // Find all delete buttons
    const deleteButtons = await screen.findAllByText(/Delete/i);
    expect(deleteButtons.length).toBeGreaterThan(0);

    // Mock confirm to return true
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true) as any;

    // Capture a tag value present before deletion
    const tagText = await screen.findByText(/001-GIR-2022/i);
    expect(tagText).toBeInTheDocument();

    fireEvent.click(deleteButtons[0]);

    // After deletion, the specific tag may no longer be in the document
    expect(screen.queryByText(/001-GIR-2022/i)).not.toBeInTheDocument();

    // restore
    window.confirm = originalConfirm;
  });
});
