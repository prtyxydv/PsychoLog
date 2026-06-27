const url = "https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyBIO26_HITC1akwtJNk19vB8yzyq74umJI";

fetch(url)
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      console.error("API Error:", JSON.stringify(data.error, null, 2));
    } else {
      console.log("Success! Models:", data.models.map(m => m.name).slice(0, 5));
    }
  })
  .catch(err => console.error("Fetch Error:", err));
