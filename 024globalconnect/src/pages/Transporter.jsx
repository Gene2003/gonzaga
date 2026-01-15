// SelectTransporter.jsx
useEffect(() => {
  fetch(`/api/transporters/find/${productId}/`)
    .then(res => res.json())
    .then(setTransporters);
}, []);
// Transporter.jsx
{transporters.map(t => (
  <div key={t.id} className="card">
    <h3>{t.name}</h3>
    <p>Distance: {t.distance_km} km</p>
    <p>Cost: KES {t.price}</p>
    <p>Rating: ⭐ {t.rating}</p>

    <button onClick={() => selectTransporter(t)}>
      Choose Transporter
    </button>
  </div>
))}

