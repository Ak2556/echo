import React, { useState } from 'react';

export default function IntegrationsPanel() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [message, setMessage] = useState('');

  const sendToSlack = async () => {
    const response = await fetch('/api/integrations/slack/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhook_url: webhookUrl, message }),
    });
    const data = await response.json();
    alert(data.message);
  };

  const sendToDiscord = async () => {
    const response = await fetch('/api/integrations/discord/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhook_url: webhookUrl, content: message }),
    });
    const data = await response.json();
    alert(data.message);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Third-Party Integrations</h2>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Slack Integration</h3>
          <input
            type="text"
            placeholder="Slack Webhook URL"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="w-full px-4 py-2 border rounded mb-3"
          />
          <textarea
            placeholder="Message to send"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 border rounded mb-3"
            rows={3}
          />
          <button
            onClick={sendToSlack}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            Send to Slack
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Discord Integration</h3>
          <button
            onClick={sendToDiscord}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Send to Discord
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Available Integrations</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">Slack</p>
                <p className="text-sm text-gray-600">
                  Send notifications and messages
                </p>
              </div>
              <span className="text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">Discord</p>
                <p className="text-sm text-gray-600">Bot and webhook support</p>
              </div>
              <span className="text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <p className="font-medium">GitHub</p>
                <p className="text-sm text-gray-600">Repository integration</p>
              </div>
              <span className="text-gray-600">Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
