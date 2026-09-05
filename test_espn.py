import requests
try:
    res = requests.get("https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard", timeout=5)
    data = res.json()
    events = data.get("events", [])
    print(f"Got {len(events)} events")
    for ev in events[:2]:
        name = ev["name"]
        status = ev["status"]["type"]["description"]
        score = f"{ev['competitions'][0]['competitors'][0]['score']} - {ev['competitions'][0]['competitors'][1]['score']}"
        print(f"{name}: {score} ({status})")
except Exception as e:
    print(f"Error: {e}")
