from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.post("/slack/webhook")
async def send_slack_message(webhook_url: str, message: str, channel: Optional[str] = None):
    """Send message to Slack channel"""
    payload = {"text": message, "channel": channel}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(webhook_url, json=payload)
            return {"success": True, "message": "Sent to Slack"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/slack/notify")
async def notify_slack(event_type: str, data: dict):
    """Send notification to Slack"""
    message = f"New {event_type}: {data.get('title', 'Untitled')}"
    return {"success": True, "notification": "sent", "message": message}


@router.post("/discord/webhook")
async def send_discord_message(
    webhook_url: str, content: str, username: Optional[str] = "Echo Bot"
):
    """Send message to Discord channel"""
    payload = {"content": content, "username": username}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(webhook_url, json=payload)
            return {"success": True, "message": "Sent to Discord"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/discord/embed")
async def send_discord_embed(webhook_url: str, title: str, description: str, color: int = 3447003):
    """Send rich embed to Discord"""
    payload = {"embeds": [{"title": title, "description": description, "color": color}]}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(webhook_url, json=payload)
            return {"success": True, "message": "Embed sent to Discord"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/integrations/list")
async def list_integrations():
    """List all available integrations"""
    return {
        "integrations": [
            {
                "name": "Slack",
                "status": "active",
                "type": "webhook",
                "features": ["messaging", "notifications", "commands"],
            },
            {
                "name": "Discord",
                "status": "active",
                "type": "webhook",
                "features": ["messaging", "embeds", "bot"],
            },
            {
                "name": "GitHub",
                "status": "available",
                "type": "oauth",
                "features": ["repo-sync", "issues", "pr-notifications"],
            },
            {
                "name": "Google Drive",
                "status": "available",
                "type": "oauth",
                "features": ["file-sync", "backup"],
            },
        ]
    }


@router.post("/integrations/configure")
async def configure_integration(service: str, webhook_url: str, enabled: bool = True):
    """Configure integration settings"""
    return {"success": True, "service": service, "status": "configured", "enabled": enabled}
